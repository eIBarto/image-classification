import pandas as pd
from collections import defaultdict
from itertools import combinations


# --- Helper function to calculate Cohen's Kappa (from previous script) ---
def calculate_cohens_kappa(contingency_matrix_df, all_labels_global):
    """
    Calculates Cohen's Kappa for a given contingency matrix (Pandas DataFrame).
    Uses all_labels_global to ensure consistent calculation of expected agreement.
    """
    n = contingency_matrix_df.sum().sum()

    if n == 0:
        return float('nan')

    observed_agreement_sum = 0
    # Ensure we only sum diagonal elements where the row label also exists as a column label
    for label_idx in contingency_matrix_df.index:
        if label_idx in contingency_matrix_df.columns:
            observed_agreement_sum += contingency_matrix_df.loc[label_idx, label_idx]
    po = observed_agreement_sum / n

    row_sums = contingency_matrix_df.sum(axis=1)
    col_sums = contingency_matrix_df.sum(axis=0)

    pe_sum_terms = 0
    for label in all_labels_global:
        prob_annotator1_label = row_sums.get(label, 0) / n
        prob_annotator2_label = col_sums.get(label, 0) / n
        pe_sum_terms += prob_annotator1_label * prob_annotator2_label

    pe = pe_sum_terms

    if pe == 1.0:
        return 1.0 if po == 1.0 else 0.0

    kappa = (po - pe) / (1 - pe)
    return kappa


# --- Main Lambda Handler Function ---
def handler(event, context):
    if 'prev' not in event:
        raise ValueError("The 'prev' property is required in the event context")

    data_input = event['prev']

    # --- Extract classification names and IDs for the new Kappa structure ---
    classification_details = {
        item['name']: {"id": item['id'], "name": item['name']}
        for item in data_input['result']['classifications']
    }

    # --- 1. Create a Pandas DataFrame from the raw data ---
    all_files_info = {f_info['file']['id']: f_info['file']['name']
                      for f_info in data_input['result']['files']}

    records = []
    for classification in data_input['result']['classifications']:
        annotation_name = classification['name']
        for result_item in classification['results']:
            file_id = result_item['fileId']
            file_name = all_files_info.get(file_id, "Unknown File")
            label_name = result_item['label']['name']
            records.append({
                'Annotation': annotation_name,
                'FileID': file_id,
                'FileName': file_name,
                'Label': label_name
            })

    df = pd.DataFrame(records)

    # --- Prepare for Contingency Tables and Kappa ---
    annotations_by_file = defaultdict(dict)
    for _, record_row in df.iterrows():
        annotations_by_file[record_row['FileID']][record_row['Annotation']] = record_row['Label']

    all_global_labels = sorted(df['Label'].unique())
    all_annotators = sorted(df['Annotation'].unique())  # These are the names of the classifications

    pairwise_contingency_tables_dict = {}
    cohens_kappa_scores_list = []  # Changed to a list for the new structure
    processing_notes = []
    warnings = []

    if len(all_annotators) >= 2:
        for annotator1_name, annotator2_name in combinations(all_annotators, 2):
            labels_for_pair = set()
            temp_ratings_for_pair = []

            for file_id, annotations_for_file in annotations_by_file.items():
                label1 = annotations_for_file.get(annotator1_name)
                label2 = annotations_for_file.get(annotator2_name)
                if label1 is not None and label2 is not None:
                    labels_for_pair.add(label1)
                    labels_for_pair.add(label2)
                    temp_ratings_for_pair.append({'label1': label1, 'label2': label2})

            sorted_labels_for_pair = sorted(list(labels_for_pair))

            kappa_value = float('nan')
            pair_key = f"{annotator1_name}_vs_{annotator2_name}"

            if not sorted_labels_for_pair:
                processing_notes.append(
                    f"No common files found for {annotator1_name} and {annotator2_name} to create contingency table.")
                pairwise_contingency_tables_dict[pair_key] = pd.DataFrame().to_dict(orient='index')
            else:
                contingency_matrix = pd.DataFrame(0, index=sorted_labels_for_pair, columns=sorted_labels_for_pair)
                for rating_pair in temp_ratings_for_pair:
                    contingency_matrix.loc[rating_pair['label1'], rating_pair['label2']] += 1

                pairwise_contingency_tables_dict[pair_key] = contingency_matrix.to_dict(orient='index')
                kappa_value = calculate_cohens_kappa(contingency_matrix, all_global_labels)

            # Create the new Kappa score entry structure
            annotator1_info = classification_details.get(annotator1_name, {"name": annotator1_name, "id": "UNKNOWN_ID"})
            annotator2_info = classification_details.get(annotator2_name, {"name": annotator2_name, "id": "UNKNOWN_ID"})

            cohens_kappa_scores_list.append({
                "score": kappa_value,
                "classifications": [
                    {"name": annotator1_info["name"], "id": annotator1_info["id"]},
                    {"name": annotator2_info["name"], "id": annotator2_info["id"]}
                ]
            })

    else:
        processing_notes.append(
            "Less than two annotators found. Cannot create pairwise contingency tables or calculate Cohen's Kappa.")

    # --- Check for conflicting labels (same as before) ---
    problematic_duplicates = defaultdict(set)
    for _, record_row in df.iterrows():
        problematic_duplicates[(record_row['Annotation'], record_row['FileID'])].add(record_row['Label'])

    has_conflicting_labels = False
    conflicting_details_list = []
    for key, labels_set in problematic_duplicates.items():
        if len(labels_set) > 1:
            original_conflict_in_classification = False
            for classification_item in data_input['result']['classifications']:
                if classification_item['name'] == key[0]:
                    labels_for_file_in_classification = set()
                    for result_item in classification_item['results']:
                        if result_item['fileId'] == key[1]:
                            labels_for_file_in_classification.add(result_item['label']['name'])
                    if len(labels_for_file_in_classification) > 1:
                        original_conflict_in_classification = True
                        conflicting_details_list.append(
                            f"Annotator {key[0]} has originally assigned multiple *different* labels to FileID {key[1]} (FileName: {all_files_info.get(key[1], 'N/A')}): {labels_set}"
                        )
                        break
            if original_conflict_in_classification:
                has_conflicting_labels = True

    if has_conflicting_labels:
        warnings.append(
            "Conflicts found where a single annotator assigned multiple different labels to the same file in their original classification data. The (last seen) unique label for each (Annotation, FileID) pair was used for contingency tables. This might need review.")
        warnings.extend([f"- {detail}" for detail in conflicting_details_list])
    else:
        processing_notes.append(
            "Checked: No single annotator assigned multiple *different* labels to the same file within their respective original classification results.")

    # --- Structure the results for JSON output ---
    results = {
        "dataframe_records": df.to_dict(orient='records'),
        "pairwise_contingency_tables": pairwise_contingency_tables_dict,  # Still useful for detailed view
        "cohens_kappa_scores": cohens_kappa_scores_list,  # Using the new list structure
        "notes": processing_notes,
        "warnings": warnings
    }

    return results
