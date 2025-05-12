import pandas as pd
import numpy as np
import logging
from collections import defaultdict
import itertools
# Scikit-learn for metrics (assuming fklearn is a wrapper or custom module)
from fklearn import cohen_kappa_score
from fklearn import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from fklearn import precision_recall_fscore_support


# Krippendorff's Alpha
import krippendorff

# --- Configuration ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


# --- Helper Functions (Data Processing) ---
def process_image_annotations(data: dict) -> tuple[pd.DataFrame, list[str]]:
    if not data or 'result' not in data:
        logging.error("Invalid data structure: 'result' key missing or data is empty for processing annotations.")
        return pd.DataFrame(), []

    files_data_list = data['result'].get('files', [])
    classifications_data = data['result'].get('classifications', [])

    if not classifications_data:
        logging.warning("No 'classifications' (runs/coder annotations) found in 'result.classifications' array.")

    file_id_to_name = {
        f['file']['id']: f['file']['name']
        for f in files_data_list
        if isinstance(f.get('file'), dict) and f['file'].get('id') and f['file'].get('name')
    }
    all_file_ids_from_files_list = set(file_id_to_name.keys())
    annotations_by_run = defaultdict(dict)
    unique_run_names = []

    for class_run in classifications_data:
        run_name = class_run.get('name')
        if not run_name:
            logging.warning("A classification run was found without a 'name'. Skipping this run.")
            continue
        if run_name not in unique_run_names:
            unique_run_names.append(run_name)
        results_in_run = class_run.get('results', [])
        if not results_in_run: continue
        current_run_annotations_with_ts = {}
        for annotation_result in results_in_run:
            file_id = annotation_result.get('fileId')
            label_obj = annotation_result.get('label')
            annotation_ts = annotation_result.get('createdAt')
            if not all([file_id, label_obj, isinstance(label_obj, dict), label_obj.get('name'), annotation_ts]):
                logging.warning(f"Skipping incomplete annotation data in run '{run_name}'. Data: {annotation_result}")
                continue
            label_name_val = label_obj['name']  # Renamed to avoid conflict with loop variable
            if file_id in current_run_annotations_with_ts:
                _, existing_ts = current_run_annotations_with_ts[file_id]
                if annotation_ts > existing_ts:
                    current_run_annotations_with_ts[file_id] = (label_name_val, annotation_ts)
            else:
                current_run_annotations_with_ts[file_id] = (label_name_val, annotation_ts)
        for f_id, (lbl, _) in current_run_annotations_with_ts.items():
            annotations_by_run[run_name][f_id] = lbl

    overview_list = []
    all_annotated_file_ids_in_runs = set()
    for run_specific_annotations in annotations_by_run.values():
        all_annotated_file_ids_in_runs.update(run_specific_annotations.keys())
    comprehensive_file_ids = sorted(list(all_file_ids_from_files_list.union(all_annotated_file_ids_in_runs)))
    for file_id in comprehensive_file_ids:
        row_data = {'file_id': file_id, 'file_name': file_id_to_name.get(file_id, "N/A - Not in main files list")}
        for run_name in unique_run_names:
            col_name = f'label_{run_name.replace(" ", "_").replace("-", "_")}'
            row_data[col_name] = annotations_by_run.get(run_name, {}).get(file_id, np.nan)
        overview_list.append(row_data)
    overview_df = pd.DataFrame(overview_list)
    if not overview_df.empty:
        label_cols_from_runs = sorted([f'label_{rn.replace(" ", "_").replace("-", "_")}' for rn in unique_run_names if
                                       f'label_{rn.replace(" ", "_").replace("-", "_")}' in overview_df.columns])
        column_order = ['file_id', 'file_name'] + label_cols_from_runs
        column_order = [col for col in column_order if col in overview_df.columns]
        overview_df = overview_df[column_order]
    unique_run_names.sort()
    return overview_df, unique_run_names


def create_long_format_annotations(overview_df: pd.DataFrame,
                                   task_name: str = "Primary_Annotation_Task") -> pd.DataFrame:
    if overview_df.empty: return pd.DataFrame()
    id_vars = ['file_id', 'file_name']
    id_vars = [col for col in id_vars if col in overview_df.columns]
    if not id_vars:
        logging.warning("Cannot create long format: 'file_id' or 'file_name' missing in overview_df.")
        return pd.DataFrame()
    value_vars = [col for col in overview_df.columns if col.startswith('label_')]
    if not value_vars:
        logging.warning("No label columns found in overview_df for long format.")
        return pd.DataFrame()
    long_df = pd.melt(overview_df, id_vars=id_vars, value_vars=value_vars, var_name='coder_temp', value_name='value')
    long_df['coder'] = long_df['coder_temp'].str.replace('label_', '', regex=False).str.replace('_', ' ', regex=True)
    long_df['from_name'] = task_name
    final_columns = ['file_id', 'file_name', 'coder', 'from_name', 'value']
    existing_final_columns = [col for col in final_columns if col in long_df.columns]
    return long_df[existing_final_columns]


def create_inter_coder_style_contingency_matrix(long_format_df: pd.DataFrame,
                                                identifier_col: str = 'file_id',
                                                coder_col: str = 'coder',
                                                value_col: str = 'value') -> pd.DataFrame:
    if long_format_df.empty or not all(col in long_format_df.columns for col in [identifier_col, coder_col, value_col]):
        logging.warning("Inter-coder matrix: Input DataFrame is empty or missing required columns.")
        return pd.DataFrame()
    try:
        contingency_matrix = pd.crosstab(index=long_format_df[identifier_col],
                                         columns=long_format_df[coder_col],
                                         values=long_format_df[value_col],
                                         aggfunc='first',
                                         dropna=False)
        all_file_ids = sorted(long_format_df[identifier_col].unique())
        contingency_matrix = contingency_matrix.reindex(all_file_ids).sort_index(axis=1)
        return contingency_matrix
    except Exception as e:
        logging.error(f"Error creating inter-coder style contingency matrix: {e}")
        return pd.DataFrame()


def calculate_majority_decision(inter_coder_matrix: pd.DataFrame) -> pd.Series:
    if inter_coder_matrix.empty: return pd.Series(dtype='object')
    modes = inter_coder_matrix.mode(axis=1, dropna=True)
    if modes.empty:
        return pd.Series(index=inter_coder_matrix.index, dtype='object')
    majority_decision = modes.iloc[:, 0]
    majority_decision = majority_decision.reindex(inter_coder_matrix.index)
    all_nan_rows = inter_coder_matrix.isnull().all(axis=1)
    majority_decision[all_nan_rows] = np.nan
    return majority_decision


def extract_gold_standard_labels(data: dict, file_id_col_name: str = 'file_id',
                                 gold_label_col_name: str = 'Gold_Standard_Label') -> pd.DataFrame:
    if not data or 'result' not in data or 'files' not in data['result']:
        logging.warning("Gold standard: 'result' or 'result.files' missing in data.")
        return pd.DataFrame(columns=[file_id_col_name, gold_label_col_name])
    gold_labels_list = []
    for file_info_wrapper in data['result']['files']:
        file_item = file_info_wrapper.get('file')
        if not isinstance(file_item, dict):
            logging.warning(f"Skipping gold file item, expected dict, got {type(file_item)}: {file_info_wrapper}")
            continue
        file_id = file_item.get('id')
        label_data = file_info_wrapper.get('label')
        if file_id and label_data and isinstance(label_data, dict) and 'name' in label_data:
            gold_labels_list.append({file_id_col_name: file_id, gold_label_col_name: label_data['name']})
        elif file_id:
            gold_labels_list.append({file_id_col_name: file_id, gold_label_col_name: np.nan})
        else:
            logging.warning(f"Skipping gold standard entry due to missing file_id: {file_info_wrapper}")
    if not gold_labels_list:
        logging.info("No gold standard labels found or extracted.")
        return pd.DataFrame(columns=[file_id_col_name, gold_label_col_name])
    return pd.DataFrame(gold_labels_list)


def calculate_pairwise_kappa(matrix_for_kappa: pd.DataFrame, task_name_for_output: str) -> pd.DataFrame:
    if matrix_for_kappa.empty or matrix_for_kappa.shape[1] < 2:
        logging.info(f"Kappa: Matrix for '{task_name_for_output}' is empty or has fewer than 2 raters.")
        return pd.DataFrame()
    raters = matrix_for_kappa.columns
    kappa_scores = []
    for i in range(len(raters)):
        for j in range(i + 1, len(raters)):
            rater1_name, rater2_name = raters[i], raters[j]
            pair_data = matrix_for_kappa[[rater1_name, rater2_name]].dropna(how='any')
            kappa = np.nan
            overlap_count = len(pair_data)
            if overlap_count >= 2:
                series1 = pair_data[rater1_name]
                series2 = pair_data[rater2_name]
                try:
                    if series1.nunique() == 1 and series2.nunique() == 1 and series1.iloc[0] == series2.iloc[0]:
                        kappa = 1.0
                    else:
                        kappa = cohen_kappa_score(series1, series2)
                except ValueError as ve:
                    logging.warning(
                        f"ValueError calculating Kappa for {rater1_name} vs {rater2_name} (overlap {overlap_count}): {ve}.")
                except Exception as e:
                    logging.error(f"Unexpected error in Kappa for {rater1_name} vs {rater2_name}: {e}")
            else:
                logging.info(
                    f"Skipping Kappa for {rater1_name} vs {rater2_name} due to insufficient overlap ({overlap_count} items).")
            kappa_scores.append({
                "Coder 1": rater1_name, "Coder 2": rater2_name,
                "Kappa": kappa, "Overlap": overlap_count,
                "Coding": task_name_for_output
            })
    return pd.DataFrame(kappa_scores)


def convert_to_reliability_data(matrix: pd.DataFrame) -> list:
    if matrix.empty: return []
    return [matrix[coder].tolist() for coder in matrix.columns]


def create_run_comparison_contingency_matrix(overview_df: pd.DataFrame, run_name_1: str,
                                             run_name_2: str) -> pd.DataFrame:
    col1_sanitized = f'label_{run_name_1.replace(" ", "_").replace("-", "_")}'
    col2_sanitized = f'label_{run_name_2.replace(" ", "_").replace("-", "_")}'
    if col1_sanitized not in overview_df.columns:
        logging.warning(f"Run comparison: Column for run '{run_name_1}' (sanitized: '{col1_sanitized}') not found.")
        return pd.DataFrame({'error': [f"Data for run '{run_name_1}' not found."]})
    if col2_sanitized not in overview_df.columns:
        logging.warning(f"Run comparison: Column for run '{run_name_2}' (sanitized: '{col2_sanitized}') not found.")
        return pd.DataFrame({'error': [f"Data for run '{run_name_2}' not found."]})
    series1 = overview_df[col1_sanitized]
    series2 = overview_df[col2_sanitized]
    series1.name = run_name_1
    series2.name = run_name_2
    common_annotations = overview_df[[col1_sanitized, col2_sanitized]].dropna(how='any')
    if common_annotations.empty:
        logging.info(f"No items commonly annotated by both runs: '{run_name_1}' and '{run_name_2}'.")
        return pd.DataFrame({'status': ["No items commonly annotated by both runs."]})
    try:
        return pd.crosstab(series1, series2, dropna=False)
    except Exception as e:
        logging.error(f"Crosstab error between '{run_name_1}' and '{run_name_2}': {e}")
        return pd.DataFrame({'error': [f"Crosstab error: {e}"]})


# --- Helper for serializing individual values (especially numpy types) ---
def format_data_value(val):
    if pd.isna(val): return None
    if isinstance(val, (np.integer)): return int(val)
    if isinstance(val, (np.floating)): return float(val)
    if isinstance(val, (np.bool_)): return bool(val)
    if isinstance(val, (int, float, bool, str)): return val
    return str(val)


def calculate_ml_metrics_package(y_true: pd.Series, y_pred: pd.Series, true_label_name: str = "True Labels",
                                 pred_label_name: str = "Predicted Labels") -> dict:
    results_package = {
        "global_metrics_df": pd.DataFrame(),
        "per_class_metrics": [],
        "confusion_matrix_df": pd.DataFrame(),
        "log_messages": []
    }

    comparison_df = pd.DataFrame({'true': y_true, 'pred': y_pred}).dropna()
    y_true_clean = comparison_df['true']
    y_pred_clean = comparison_df['pred']

    if y_true_clean.empty:
        results_package["log_messages"].append(
            f"ML Metrics: No overlapping non-missing data for '{true_label_name}' vs '{pred_label_name}'.")
        return results_package

    all_present_labels = pd.concat([y_true_clean, y_pred_clean]).unique()
    unique_labels = sorted([label for label in all_present_labels if pd.notna(label)])

    if not unique_labels:
        results_package["log_messages"].append(
            f"ML Metrics: No unique valid labels after cleaning for '{true_label_name}' vs '{pred_label_name}'.")
        return results_package

    accuracy = accuracy_score(y_true_clean, y_pred_clean)
    global_metrics_data = [{'Metric': 'Accuracy', 'Value': format_data_value(accuracy), 'Average/Label': 'N/A'}]

    per_class_metrics_list = []

    p_per, r_per, f1_per, s_per = precision_recall_fscore_support(y_true_clean, y_pred_clean, labels=unique_labels,
                                                                  average=None, zero_division=0)
    for i, current_label_name in enumerate(unique_labels):  # Renamed loop variable to avoid conflict
        class_metrics_values = {
            'precision': format_data_value(p_per[i]),
            'recall': format_data_value(r_per[i]),
            'f_1_score': format_data_value(f1_per[i]),  # Key is f_1_score
            'support': format_data_value(s_per[i])
        }
        per_class_metrics_list.append({
            "label_name": str(current_label_name),  # Key changed from "className"
            "metrics": class_metrics_values
        })
    results_package["per_class_metrics"] = per_class_metrics_list

    if len(unique_labels) == 1:
        results_package["log_messages"].append(
            f"ML Metrics: Only one unique label ('{unique_labels[0]}') present. Per-class metrics calculated. Accuracy is primary global metric.")
        p, r, f1 = p_per[0], r_per[0], f1_per[0]
        global_metrics_data.append(
            {'Metric': 'Precision (Macro)', 'Value': format_data_value(p), 'Average/Label': 'macro'})
        global_metrics_data.append(
            {'Metric': 'Recall (Macro)', 'Value': format_data_value(r), 'Average/Label': 'macro'})
        global_metrics_data.append(
            {'Metric': 'F1 Score (Macro)', 'Value': format_data_value(f1), 'Average/Label': 'macro'})
        global_metrics_data.append(
            {'Metric': 'Precision (Weighted)', 'Value': format_data_value(p), 'Average/Label': 'weighted'})
        global_metrics_data.append(
            {'Metric': 'Recall (Weighted)', 'Value': format_data_value(r), 'Average/Label': 'weighted'})
        global_metrics_data.append(
            {'Metric': 'F1 Score (Weighted)', 'Value': format_data_value(f1), 'Average/Label': 'weighted'})

    else:
        if len(unique_labels) == 2:
            results_package["log_messages"].append(
                f"ML Metrics: Binary classification for labels: {unique_labels}. Per-class and averaged metrics calculated.")
        else:
            results_package["log_messages"].append(
                f"ML Metrics: Multiclass classification for labels: {unique_labels}. Per-class and averaged metrics calculated.")

        for avg in ['macro', 'weighted']:
            prec_avg = precision_score(y_true_clean, y_pred_clean, labels=unique_labels, average=avg, zero_division=0)
            rec_avg = recall_score(y_true_clean, y_pred_clean, labels=unique_labels, average=avg, zero_division=0)
            f1_avg = f1_score(y_true_clean, y_pred_clean, labels=unique_labels, average=avg, zero_division=0)

            global_metrics_data.append(
                {'Metric': f'Precision ({avg.capitalize()})', 'Value': format_data_value(prec_avg),
                 'Average/Label': avg})
            global_metrics_data.append(
                {'Metric': f'Recall ({avg.capitalize()})', 'Value': format_data_value(rec_avg), 'Average/Label': avg})
            global_metrics_data.append(
                {'Metric': f'F1 Score ({avg.capitalize()})', 'Value': format_data_value(f1_avg), 'Average/Label': avg})

    results_package["global_metrics_df"] = pd.DataFrame(global_metrics_data)
    try:
        cm = confusion_matrix(y_true_clean, y_pred_clean, labels=unique_labels)
        results_package["confusion_matrix_df"] = pd.DataFrame(cm,
                                                              index=pd.Index(unique_labels, name='True Label'),
                                                              columns=pd.Index(unique_labels, name='Predicted Label'))
    except ValueError as e:
        results_package["log_messages"].append(f"Error creating confusion matrix (labels: {unique_labels}): {e}")

    return results_package


# --- Helper Functions for Custom Serialization ---
def format_dataframe_for_schema(df: pd.DataFrame):
    if df is None: return None
    if df.empty:
        return {"columns": [str(col) for col in df.columns.tolist()], "index": [str(idx) for idx in df.index.tolist()],
                "data_rows": []}

    columns_as_strings = [str(col) for col in df.columns.tolist()]
    index_as_strings = [str(idx) for idx in df.index.tolist()]
    data_rows_list = [{"values": [format_data_value(df.iloc[i, col_idx]) for col_idx in range(len(df.columns))]} for i
                      in range(len(df))]
    return {"columns": columns_as_strings, "index": index_as_strings, "data_rows": data_rows_list}


def format_series_for_schema(series: pd.Series):
    if series is None: return None
    if series.empty:
        output = {"index": [str(idx) for idx in series.index.tolist()], "data": []}
        if series.name: output["name"] = str(series.name)
        return output

    output = {"index": [str(idx) for idx in series.index.tolist()],
              "data": [format_data_value(val) for val in series.tolist()]}
    if series.name: output["name"] = str(series.name)
    return output


# --- Core Analysis Function ---
def run_analysis(annotation_data: dict) -> dict:
    results = {"dataframes": {}, "metrics": {}, "logs": []}
    if not annotation_data:
        results["logs"].append("Critical Error: Annotation data is missing or empty in run_analysis.")
        return results

    overview_df, available_runs = process_image_annotations(annotation_data)
    if overview_df.empty and not available_runs:
        results["logs"].append("Warning: Processing annotations yielded an empty overview DataFrame and no run names.")
    results["dataframes"]["overview_annotations_wide"] = overview_df
    results["dataframes"]["annotations_long_format"] = create_long_format_annotations(overview_df)
    inter_coder_matrix = create_inter_coder_style_contingency_matrix(results["dataframes"]["annotations_long_format"])
    results["dataframes"]["inter_coder_contingency_matrix"] = inter_coder_matrix
    majority_decision_s = calculate_majority_decision(inter_coder_matrix)
    results["dataframes"]["majority_decision_annotations"] = majority_decision_s
    gold_standard_df = extract_gold_standard_labels(annotation_data)
    results["dataframes"]["gold_standard_labels"] = gold_standard_df

    comparison_table = pd.DataFrame()
    all_ids_list = []
    if not overview_df.empty and 'file_id' in overview_df.columns:
        all_ids_list.extend(overview_df['file_id'].dropna().unique())
    if not gold_standard_df.empty and 'file_id' in gold_standard_df.columns:
        all_ids_list.extend(gold_standard_df['file_id'].dropna().unique())

    if not all_ids_list:
        results["logs"].append("No valid file_ids found in overview_df or gold_standard_df to build comparison table.")
        results["dataframes"]["combined_comparison_table"] = pd.DataFrame()
    else:
        unique_all_ids = sorted(list(set(all_ids_list)))
        comparison_table = pd.DataFrame(index=pd.Index(unique_all_ids, name='file_id'))
        if not overview_df.empty and 'file_name' in overview_df.columns and 'file_id' in overview_df.columns:
            file_names_map = overview_df.drop_duplicates(subset=['file_id']).set_index('file_id')['file_name']
            comparison_table = comparison_table.join(file_names_map, how='left')
        if not inter_coder_matrix.empty:
            comparison_table = comparison_table.join(inter_coder_matrix, how='left')
        if not majority_decision_s.empty:
            maj_dec_name = 'Majority_Decision_from_Runs'
            majority_decision_s_named = majority_decision_s.rename(maj_dec_name)
            comparison_table = comparison_table.join(majority_decision_s_named, how='left')
            results["dataframes"]["majority_decision_annotations"] = majority_decision_s_named
        if not gold_standard_df.empty and 'file_id' in gold_standard_df.columns and 'Gold_Standard_Label' in gold_standard_df.columns:
            gs_for_join = gold_standard_df.drop_duplicates(subset=['file_id']).set_index('file_id')
            comparison_table = comparison_table.join(gs_for_join, how='left')
        results["dataframes"]["combined_comparison_table"] = comparison_table

    results["metrics"]["inter_rater_reliability"] = {}
    results["metrics"]["model_evaluations"] = {}
    matrix_for_irr = inter_coder_matrix
    if not matrix_for_irr.empty and matrix_for_irr.shape[1] >= 2:
        results["metrics"]["inter_rater_reliability"][
            "cohens_kappa_between_annotation_runs"] = calculate_pairwise_kappa(matrix_for_irr,
                                                                               "AnnotationRunsComparison")
        k_matrix_for_alpha = matrix_for_irr.dropna(how='all')
        if not k_matrix_for_alpha.empty and k_matrix_for_alpha.shape[0] >= 1:
            k_data = convert_to_reliability_data(k_matrix_for_alpha)
            if k_data and len(k_data) >= 2 and any(len(cr) > 0 for cr in k_data):
                flat_data_for_check = [item for sublist in k_data for item in sublist if pd.notna(item)]
                if len(set(flat_data_for_check)) > 1:
                    try:
                        alpha_value = krippendorff.alpha(reliability_data=k_data, level_of_measurement='nominal')
                        results["metrics"]["inter_rater_reliability"]["krippendorff_alpha"] = alpha_value
                    except Exception as e:
                        results["logs"].append(f"Krippendorff alpha calculation error: {e}.")
                        results["metrics"]["inter_rater_reliability"]["krippendorff_alpha"] = None
                else:
                    results["logs"].append(
                        "Krippendorff alpha not calculated: Data lacks sufficient variance for calculation.")
                    results["metrics"]["inter_rater_reliability"]["krippendorff_alpha"] = None
            else:
                results["logs"].append(
                    "Krippendorff alpha not calculated: Not enough data/coders for reliability_data after processing.")
                results["metrics"]["inter_rater_reliability"]["krippendorff_alpha"] = None
        else:
            results["logs"].append(
                "Krippendorff alpha not calculated: Matrix for alpha empty after all-NaN rows dropped or not enough valid items.")
            results["metrics"]["inter_rater_reliability"]["krippendorff_alpha"] = None
    else:
        results["logs"].append(
            "Skipping inter-rater reliability (Kappa, Krippendorff): Less than 2 coders/runs or no data in inter_coder_matrix.")
        results["metrics"]["inter_rater_reliability"]["krippendorff_alpha"] = None

    gs_col_name = 'Gold_Standard_Label'
    maj_dec_col_name = 'Majority_Decision_from_Runs'
    if not comparison_table.empty and gs_col_name in comparison_table.columns:
        if maj_dec_col_name in comparison_table.columns:
            df_kappa_eval_maj_gs = comparison_table[[gs_col_name, maj_dec_col_name]].copy()
            kappa_maj_gs_df = calculate_pairwise_kappa(df_kappa_eval_maj_gs, "MajorityVsGold")
            if not kappa_maj_gs_df.empty:
                results["metrics"]["inter_rater_reliability"]["cohens_kappa_majority_vs_gold"] = kappa_maj_gs_df
            else:
                results["logs"].append("No Cohen's Kappa calculated for Majority vs Gold.")
            y_true_maj = comparison_table[gs_col_name]
            y_pred_maj = comparison_table[maj_dec_col_name]
            results["metrics"]["model_evaluations"]["majority_decision_vs_gold_standard"] = \
                calculate_ml_metrics_package(y_true_maj, y_pred_maj, "Gold Standard", "Majority Decision")
        else:
            results["logs"].append(f"'{maj_dec_col_name}' column not found for Gold Standard eval.")
        run_evals_list = []
        for run_name_original in available_runs:
            if run_name_original in comparison_table.columns:
                y_true_run = comparison_table[gs_col_name]
                y_pred_run = comparison_table[run_name_original]
                pkg = calculate_ml_metrics_package(y_true_run, y_pred_run, "Gold Standard", run_name_original)
                run_evals_list.append({"annotation_run_name": run_name_original, "evaluation_metrics": pkg})
            else:
                results["logs"].append(f"Run '{run_name_original}' not found for Gold Standard eval.")
        if run_evals_list:
            results["metrics"]["model_evaluations"]["annotation_runs_vs_gold_standard"] = run_evals_list
    else:
        results["logs"].append("Gold Standard Label column not found, skipping evaluations against it.")

    pairwise_matrices_output = []
    if len(available_runs) >= 2 and not overview_df.empty:
        for r1_orig, r2_orig in itertools.combinations(available_runs, 2):
            cm_df = create_run_comparison_contingency_matrix(overview_df, r1_orig, r2_orig)
            pairwise_matrices_output.append(
                {"run_1_name": r1_orig, "run_2_name": r2_orig, "contingency_matrix_df": cm_df})
    if pairwise_matrices_output: results["dataframes"]["pairwise_run_contingency_matrices"] = pairwise_matrices_output
    return results


# --- Lambda Handler (Main Entry Point) ---
def handler(event, context):
    logging.info("Lambda handler started.")
    if not isinstance(event, dict):
        logging.error("Input event is not a dictionary.")
        raise TypeError("Input event must be a dictionary.")
    if 'prev' not in event:
        logging.error("The 'prev' key is missing in the event payload.")
        raise ValueError("The 'prev' key is required in the event payload.")
    actual_annotation_data = event.get('prev')
    if not isinstance(actual_annotation_data, dict):
        logging.error(f"Data under 'prev' key is not a dictionary, type found: {type(actual_annotation_data)}")
        raise TypeError(f"Data under 'prev' key must be a dictionary, got {type(actual_annotation_data)}.")

    analysis_results = run_analysis(actual_annotation_data)
    final_response_body = {"logs": analysis_results.get("logs", [])}

    data_overview_section = {}
    df_keys_for_overview = [
        ("overview_annotations_wide", "overview_annotations_wide"),
        ("annotations_long_format", "annotations_long_format"),
        ("inter_coder_contingency_matrix", "inter_coder_contingency_matrix"),
        ("majority_decision_annotations", "majority_decision_annotations"),
        ("gold_standard_labels", "gold_standard_labels"),
        ("combined_comparison_table", "combined_comparison_table")
    ]
    for source_key, target_key in df_keys_for_overview:
        item = analysis_results["dataframes"].get(source_key)
        formatted_item = None
        if isinstance(item, pd.DataFrame):
            formatted_item = format_dataframe_for_schema(item)
        elif isinstance(item, pd.Series):
            formatted_item = format_series_for_schema(item)
        if formatted_item is not None: data_overview_section[target_key] = formatted_item
    pairwise_matrices_list = []
    raw_pairwise_matrices = analysis_results["dataframes"].get("pairwise_run_contingency_matrices", [])
    for matrix_info in raw_pairwise_matrices:
        formatted_matrix = format_dataframe_for_schema(matrix_info.get("contingency_matrix_df"))
        pairwise_matrices_list.append({
            "compared_runs": f"{matrix_info.get('run_1_name', 'UnknownRun1')} vs {matrix_info.get('run_2_name', 'UnknownRun2')}",
            "run_1_name": matrix_info.get('run_1_name'),
            "run_2_name": matrix_info.get('run_2_name'),
            "contingency_matrix": formatted_matrix
        })
    if pairwise_matrices_list: data_overview_section["pairwise_run_contingency_matrices"] = pairwise_matrices_list
    if data_overview_section: final_response_body["data_overview"] = data_overview_section

    irr_section = {}
    metrics_irr = analysis_results["metrics"].get("inter_rater_reliability", {})
    k_alpha = metrics_irr.get("krippendorff_alpha")
    irr_section["krippendorff_alpha"] = k_alpha

    kappa_output = {}
    kappa_maj_vs_gold_df = metrics_irr.get("cohens_kappa_majority_vs_gold")
    if kappa_maj_vs_gold_df is not None:
        kappa_output["majority_vs_gold"] = format_dataframe_for_schema(kappa_maj_vs_gold_df)
    kappa_between_runs_df = metrics_irr.get("cohens_kappa_between_annotation_runs")
    if kappa_between_runs_df is not None:
        kappa_output["between_annotation_runs"] = format_dataframe_for_schema(kappa_between_runs_df)
    if kappa_output: irr_section["cohens_kappa"] = kappa_output

    if irr_section.get("krippendorff_alpha") is not None or irr_section.get("cohens_kappa"):
        final_response_body["inter_rater_reliability"] = irr_section
    elif "krippendorff_alpha" in irr_section:  # It exists but is None, and no kappa
        final_response_body["inter_rater_reliability"] = {"krippendorff_alpha": None}

    model_eval_section = {}
    metrics_model_eval = analysis_results["metrics"].get("model_evaluations", {})
    maj_vs_gold_eval_pkg = metrics_model_eval.get("majority_decision_vs_gold_standard")
    if maj_vs_gold_eval_pkg:
        current_eval_output = {
            "metrics_summary": format_dataframe_for_schema(maj_vs_gold_eval_pkg.get("global_metrics_df")),
            "per_class_metrics": maj_vs_gold_eval_pkg.get("per_class_metrics"),
            "confusion_matrix": format_dataframe_for_schema(maj_vs_gold_eval_pkg.get("confusion_matrix_df")),
            "log_messages": maj_vs_gold_eval_pkg.get("log_messages", [])
        }
        # Ensure all expected keys are present, even if their values are None or empty lists
        # (except for DataFrames that might be None if not computed)
        final_maj_eval = {}
        final_maj_eval["metrics_summary"] = current_eval_output["metrics_summary"]
        final_maj_eval["per_class_metrics"] = current_eval_output.get("per_class_metrics", [])
        final_maj_eval["confusion_matrix"] = current_eval_output["confusion_matrix"]
        final_maj_eval["log_messages"] = current_eval_output.get("log_messages", [])
        model_eval_section["majority_decision_vs_gold_standard"] = final_maj_eval

    runs_vs_gold_list_output = []
    raw_runs_vs_gold_list = metrics_model_eval.get("annotation_runs_vs_gold_standard", [])
    for run_eval_item in raw_runs_vs_gold_list:
        eval_metrics_pkg = run_eval_item.get("evaluation_metrics", {})
        # Ensure all expected keys are present in the final dict for each run
        formatted_run_eval_dict = {
            "annotation_run_name": run_eval_item.get("annotation_run_name"),
            "metrics_summary": format_dataframe_for_schema(eval_metrics_pkg.get("global_metrics_df")),
            "per_class_metrics": eval_metrics_pkg.get("per_class_metrics", []),  # Default to empty list
            "confusion_matrix": format_dataframe_for_schema(eval_metrics_pkg.get("confusion_matrix_df")),
            "log_messages": eval_metrics_pkg.get("log_messages", [])  # Default to empty list
        }
        runs_vs_gold_list_output.append(formatted_run_eval_dict)

    if runs_vs_gold_list_output: model_eval_section["annotation_runs_vs_gold_standard"] = runs_vs_gold_list_output
    if model_eval_section: final_response_body["model_evaluations"] = model_eval_section

    logging.info("Lambda handler finished. Returning data dictionary.")
    return final_response_body