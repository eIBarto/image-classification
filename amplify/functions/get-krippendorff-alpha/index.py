import pandas as pd
import numpy as np
import krippendorff


# --- Main Lambda Handler Function ---
def handler(event, context):
    if 'prev' not in event:
        raise ValueError("The 'prev' property is required in the event context")

    data_input = event['prev']

    processing_notes = []
    warnings = []
    debug_info = {}

    # --- 1. Initial Data Preparation ---
    all_files_info = {f_info['file']['id']: f_info['file']['name']
                      for f_info in data_input['result']['files']}

    records = []
    for classification in data_input['result']['classifications']:
        annotation_name = classification['name']
        for result_item in classification['results']:
            file_id = result_item['fileId']
            label_name_original = "__MISSING_LABEL__"  # Default for malformed data
            if 'label' in result_item and isinstance(result_item['label'], dict) and 'name' in result_item['label']:
                label_name_original = result_item['label']['name']
                if not isinstance(label_name_original, str):
                    warnings.append(
                        f"Warning: Label for file {file_id}, annotator {annotation_name} is not a string: {label_name_original}. Converting to string.")
                    label_name_original = str(label_name_original)
            else:
                warnings.append(
                    f"Warning: Missing or malformed label for file {file_id}, annotator {annotation_name}. Using placeholder.")

            records.append({
                'Annotation': annotation_name,
                'FileID': file_id,
                'Label': label_name_original.strip()  # Clean leading/trailing spaces
            })

    if not records:
        warnings.append("No annotation records found in the input data.")
        return {
            "krippendorff_alpha": None,  # Consistent null for NaN
            "notes": processing_notes,
            "warnings": warnings,
            "debug_info": {"reliability_data_summary": "No data to process."}
        }

    df = pd.DataFrame(records)
    annotations_by_file_item = {}  # {file_id: {annotator_name: label}}
    all_file_ids = sorted(list(df['FileID'].unique()))
    all_annotator_names = sorted(list(df['Annotation'].unique()))

    unique_labels_in_source_data_str = sorted(list(df['Label'].unique()))
    debug_info["unique_string_labels_in_source_data"] = unique_labels_in_source_data_str
    processing_notes.append(f"Unique string labels found: {unique_labels_in_source_data_str}")

    # Create mapping for string labels to integers
    label_to_int_map = {label: i for i, label in enumerate(unique_labels_in_source_data_str)}
    debug_info["label_to_integer_mapping"] = label_to_int_map
    processing_notes.append(f"String-to-integer mapping used: {label_to_int_map}")

    for file_id in all_file_ids:
        annotations_by_file_item[file_id] = {}
    for _, row in df.iterrows():  # Populate with the last seen label
        annotations_by_file_item[row['FileID']][row['Annotation']] = row['Label']

    # Conflict check (Optional: can be commented out if not needed for final script)
    problematic_duplicates_check = {}
    for _, record_row in df.iterrows():
        key = (record_row['Annotation'], record_row['FileID'])
        if key not in problematic_duplicates_check: problematic_duplicates_check[key] = set()
        problematic_duplicates_check[key].add(record_row['Label'])
    if any(len(labels) > 1 for labels in problematic_duplicates_check.values()):
        warnings.append(
            "Note: Some annotators provided multiple different labels for the same file. The last observed label was used.")
    else:
        processing_notes.append(
            "Checked: No single annotator assigned multiple *different* labels to the same file (or last one used).")

    if not all_file_ids or len(all_annotator_names) == 0:
        warnings.append("Not enough files or annotators to calculate Krippendorff's Alpha.")
        return {
            "krippendorff_alpha": None,
            "notes": processing_notes,
            "warnings": warnings,
            "debug_info": {
                "reliability_data_summary": f"Files: {len(all_file_ids)}, Annotators: {len(all_annotator_names)}"}
        }

    # --- 2. Prepare data matrix (Standard Items x Raters format first) ---
    reliability_data_numeric_items_x_raters = []
    found_missing_values = False
    for file_id in all_file_ids:
        ratings_for_this_file_numeric = []
        for annotator_name in all_annotator_names:
            label_str = annotations_by_file_item[file_id].get(annotator_name)
            if label_str is None or label_str == "__MISSING_LABEL__":
                ratings_for_this_file_numeric.append(np.nan)
                found_missing_values = True
            else:
                mapped_int = label_to_int_map.get(label_str)
                if mapped_int is None:  # Should not happen if labels are from unique_labels_in_source_data_str
                    warnings.append(
                        f"Critical Logic Error: Label '{label_str}' not in map. Defaulting to -1. This indicates an issue.")
                    ratings_for_this_file_numeric.append(-1)  # Error code
                else:
                    ratings_for_this_file_numeric.append(mapped_int)
        reliability_data_numeric_items_x_raters.append(ratings_for_this_file_numeric)

    if found_missing_values:
        processing_notes.append(
            "INFO: Missing data (np.nan) was present in the matrix. How your library handles np.nan by default is important if 'missing_items' argument is not supported/used.")
    debug_info["reliability_matrix_numeric_ITEMS_X_RATERS_sample"] = [row[:5] for row in
                                                                      reliability_data_numeric_items_x_raters[:3]]

    # --- 3. Transpose matrix for the specific library and Calculate Alpha ---
    kripp_alpha_value = float('nan')
    reliability_data_for_alpha_calc = []

    if reliability_data_numeric_items_x_raters and reliability_data_numeric_items_x_raters[0]:
        try:
            # Transpose to Raters x Items format, as this library expects it
            reliability_data_for_alpha_calc = np.array(reliability_data_numeric_items_x_raters, dtype=object).T.tolist()
            debug_info["transposed_matrix_RATERS_X_ITEMS_sample (used for calc)"] = [row[:5] for row in
                                                                                     reliability_data_for_alpha_calc[
                                                                                     :3]]
            processing_notes.append(
                f"Data matrix transposed to Raters x Items format ({len(reliability_data_for_alpha_calc)} raters x {len(reliability_data_for_alpha_calc[0])} items) for this specific Krippendorff library.")

            if not reliability_data_for_alpha_calc or not reliability_data_for_alpha_calc[0] or \
                    len(reliability_data_for_alpha_calc) < 2 or len(reliability_data_for_alpha_calc[
                                                                        0]) < 2:  # Kripp alpha needs at least 2 "raters" (orig files) and 2 "items" (orig raters) in this transposed view.
                warnings.append(
                    "Not enough data dimensions after transposition for Krippendorff's Alpha calculation (e.g., <2 original files or <2 original raters).")
            else:
                kripp_alpha_value = krippendorff.alpha(reliability_data_for_alpha_calc,
                                                       level_of_measurement='nominal')
                processing_notes.append(
                    f"Krippendorff's Alpha calculated using NUMERIC, TRANSPOSED (Raters x Items) data: {kripp_alpha_value}")
        except Exception as e:
            warnings.append(f"Error during Krippendorff's Alpha calculation with transposed data: {str(e)}")
    else:
        warnings.append("Numeric data matrix (Items x Raters) was empty or malformed before transposition.")

    if pd.isna(kripp_alpha_value) and not any("Error during" in w for w in warnings):
        warnings.append("Krippendorff's Alpha calculation resulted in NaN. Check data variability and dimensions.")

    # --- Add note about library behavior ---
    processing_notes.append(
        "IMPORTANT NOTE: This calculation uses a transposed data matrix (Raters x Items) due to the non-standard behavior of the currently used Krippendorff library. For standard libraries, Items x Raters is typical.")
    if getattr(krippendorff, '__version__', 'unknown') == 'unknown':
        warnings.append(
            "CRITICAL WARNING: The Krippendorff library version is unknown and has demonstrated non-standard behavior. Results should be treated with extreme caution. Consider reinstalling a standard version from PyPI ('pip install --force-reinstall krippendorff').")

    # --- Structure the results for JSON output ---
    results = {
        "krippendorff_alpha": kripp_alpha_value if not pd.isna(kripp_alpha_value) else None,
        "data_summary": {
            "number_of_items_annotated": len(all_file_ids),
            "number_of_annotators": len(all_annotator_names),
            "annotator_names": all_annotator_names,
        },
        "notes": processing_notes,
        "warnings": warnings,
        "debug_info": debug_info
    }
    
    return results