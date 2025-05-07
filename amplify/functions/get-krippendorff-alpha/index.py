import pandas as pd
import json
import numpy as np
from krippendorff import alpha

def transform_for_krippendorff(json_data):
    """
    Transform JSON data into a format suitable for Krippendorff's alpha calculation
    Ensures that all files from the files property are included
    """
    # Extract the main components
    result = json_data.get("result", {})
    files = result.get("files", [])
    classifications = result.get("classifications", [])

    # Get all file IDs
    file_ids = [file_entry.get("fileId") for file_entry in files]

    # Transform data to wide format first
    # Create a dictionary to store the data for each file
    wide_data = {file_id: {} for file_id in file_ids}

    # Process each classification
    for classification in classifications:
        classification_id = classification.get("id")

        # Process each result in this classification
        for result_entry in classification.get("results", []):
            file_id = result_entry.get("fileId")
            label_id = result_entry.get("labelId")

            # Add this result to our wide data
            if file_id in wide_data:
                wide_data[file_id][classification_id] = label_id

    # Convert to reliability data format for Krippendorff's alpha
    # Create a matrix where rows are coders (classifications) and columns are units (files)
    reliability_data = []

    # For each classification (coder)
    for classification in classifications:
        classification_id = classification.get("id")
        row = []
        # For each file (unit)
        for file_id in file_ids:
            # Get the label for this file and classification, or use None for missing data
            label = wide_data[file_id].get(classification_id)
            row.append(label)
        reliability_data.append(row)

    # Convert to numpy array
    reliability_data = np.array(reliability_data, dtype=object)

    return reliability_data, file_ids, [c.get("id") for c in classifications]


def calculate_krippendorff_alpha(reliability_data):
    """
    Calculate Krippendorff's alpha using the krippendorff library
    """
    # Create a mapping of unique non-NaN values to integers
    unique_values = {}
    next_id = 0

    # Create a copy as a numeric array
    # First, get the shape
    rows, cols = reliability_data.shape
    mapped_data = np.zeros((rows, cols))

    # Fill with NaN initially
    mapped_data.fill(np.nan)

    # Now map string values to integers
    for i in range(rows):
        for j in range(cols):
            val = reliability_data[i, j]
            # Check if it's not NaN (could be None or np.nan)
            if val is not None and not (isinstance(val, float) and np.isnan(val)):
                if val not in unique_values:
                    unique_values[val] = next_id
                    next_id += 1
                mapped_data[i, j] = unique_values[val]

    # Calculate alpha with nominal metric (string values are treated as categories)
    alpha_nominal = alpha(reliability_data=mapped_data, level_of_measurement='nominal')

    # Return the calculated alpha value and the value mapping for reference
    return alpha_nominal, unique_values


def calculate_agreement_percentage(reliability_data):
    """
    Calculate the percentage of perfect agreement across all units/files
    """
    total_units = reliability_data.shape[1]
    agreement_count = 0
    agreement_details = []

    for unit_idx in range(total_units):
        unit_data = reliability_data[:, unit_idx]
        # Remove missing values (None)
        valid_data = [val for val in unit_data if val is not None]

        # If there are at least 2 valid ratings
        if len(valid_data) >= 2:
            # Check if they all agree
            has_agreement = len(set(valid_data)) == 1
            agreement_details.append({
                "unit_index": unit_idx,
                "has_agreement": has_agreement,
                "values": [str(v) if v is not None else None for v in unit_data],
                "unique_values": list(set([str(v) for v in valid_data if v is not None]))
            })

            if has_agreement:
                agreement_count += 1

    agreement_percentage = (agreement_count / total_units) * 100 if total_units > 0 else 0

    return agreement_percentage, agreement_details


def interpret_alpha(alpha_value):
    """
    Provide an interpretation of the Krippendorff's alpha value
    """
    if alpha_value > 0.8:
        return "Excellent reliability (α > 0.8): There is strong agreement between classifications"
    elif alpha_value > 0.667:
        return "Good reliability (0.667 < α ≤ 0.8): The classifications show substantial agreement"
    elif alpha_value > 0.4:
        return "Moderate reliability (0.4 < α ≤ 0.667): There is moderate agreement, but conclusions should be tentative"
    else:
        return "Poor reliability (α ≤ 0.4): The agreement between classifications is weak, suggesting inconsistent classification"


def export_json_for_frontend(results, output_path="reliability_results.json"):
    """
    Export the results as a JSON file formatted for frontend display
    """
    # Convert numpy arrays to lists for JSON serialization
    frontend_data = {
        "alpha_value": float(results["alpha_nominal"]),
        "agreement_percentage": float(results["agreement_percentage"]),
        "interpretation": results["interpretation"],
        "reliability_data": results["reliability_data_list"],
        "file_ids": results["file_ids"],
        "classification_ids": results["classification_ids"],
        "agreement_details": results["agreement_details"],
        "value_mapping": results["value_mapping"]
    }

    # Write to JSON file
    with open(output_path, 'w') as f:
        json.dump(frontend_data, f, indent=2)

    print(f"Results exported to {output_path} for frontend display")

    return frontend_data


def process_json_file_alpha(file_path, export_path="reliability_results.json"):
    """
    Process a JSON file, calculate Krippendorff's alpha, and export results as JSON
    """
    # Load the JSON data
    with open(file_path, 'r') as f:
        data = json.load(f)

    # Transform the data for Krippendorff's alpha calculation
    reliability_data, file_ids, classification_ids = transform_for_krippendorff(data)

    # Calculate Krippendorff's alpha using the krippendorff library
    alpha_nominal, value_mapping = calculate_krippendorff_alpha(reliability_data)

    # Calculate agreement percentage
    agreement_percentage, agreement_details = calculate_agreement_percentage(reliability_data)

    # Get interpretation
    alpha_interpretation = interpret_alpha(alpha_nominal)

    # Set display options
    pd.set_option('display.max_columns', None)
    pd.set_option('display.width', 1000)
    pd.set_option('display.max_rows', None)

    # Display the results in console
    print("\n=== Krippendorff's Alpha Values ===")
    print(f"Nominal measurement: {alpha_nominal:.4f}")
    print(f"\nPercentage agreement: {agreement_percentage:.2f}%")
    print("\n=== Interpretation ===")
    print(alpha_interpretation)

    # Export the reliability data to CSV for inspection
    reliability_df = pd.DataFrame(reliability_data)
    reliability_df.to_csv("reliability_data.csv", index=False)

    # Prepare results for JSON export
    # Convert numpy array to list for JSON serialization
    reliability_data_list = reliability_data.tolist()
    # Replace None values with null for proper JSON serialization
    reliability_data_list = [[None if v is None else str(v) for v in row] for row in reliability_data_list]

    results = {
        "reliability_data_list": reliability_data_list,
        "alpha_nominal": alpha_nominal,
        "agreement_percentage": agreement_percentage,
        "interpretation": alpha_interpretation,
        "file_ids": file_ids,
        "classification_ids": classification_ids,
        "agreement_details": agreement_details,
        "value_mapping": {str(k): v for k, v in value_mapping.items()}
    }

    # Export to JSON for frontend
    frontend_data = export_json_for_frontend(results, export_path)

    return results


def process_json_data_alpha(json_data):
    """
    Process JSON data directly and calculate Krippendorff's alpha

    Parameters:
    - json_data: Dictionary containing the JSON data to process

    Returns:
    - Dictionary with reliability analysis results
    """
    # Transform the data for Krippendorff's alpha calculation
    reliability_data, file_ids, classification_ids = transform_for_krippendorff(json_data)

    # Calculate Krippendorff's alpha using the krippendorff library
    alpha_nominal, value_mapping = calculate_krippendorff_alpha(reliability_data)

    # Calculate agreement percentage
    agreement_percentage, agreement_details = calculate_agreement_percentage(reliability_data)

    # Get interpretation
    alpha_interpretation = interpret_alpha(alpha_nominal)

    # Prepare results for JSON export
    # Convert numpy array to list for JSON serialization
    reliability_data_list = reliability_data.tolist()
    # Replace None values with null for proper JSON serialization
    reliability_data_list = [[None if v is None else str(v) for v in row] for row in reliability_data_list]

    results = {
        "reliability_data_list": reliability_data_list,
        "alpha_nominal": alpha_nominal,
        "agreement_percentage": agreement_percentage,
        "interpretation": alpha_interpretation,
        "file_ids": file_ids,
        "classification_ids": classification_ids,
        "agreement_details": agreement_details,
        "value_mapping": {str(k): v for k, v in value_mapping.items()}
    }

    return results


# Lambda handler function
def handler(event, context):
    """
    AWS Lambda handler function

    Parameters:
    - event: Contains information from the trigger, including the 'prev' property
             with the JSON data to analyze
    - context: Contains runtime information

    Returns:
    - Dictionary containing reliability analysis results

    Raises:
    - Exception: If 'prev' data is missing or processing fails
    """
    # Check if prev exists in the event
    prev_value = event.get('prev', None)

    if not prev_value:
        raise Exception("No 'prev' data found in the event")

    # Process the JSON data directly
    results = process_json_data_alpha(prev_value)

    # Return the results directly
    return {
        'alpha_value': float(results['alpha_nominal']),
        'agreement_percentage': float(results['agreement_percentage']),
        'interpretation': results['interpretation'],
        'reliability_data': results['reliability_data_list'],
        'file_ids': results['file_ids'],
        'classification_ids': results['classification_ids'],
        'agreement_details': results['agreement_details'],
        'value_mapping': results['value_mapping']
    }