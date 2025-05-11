import pandas as pd
import numpy as np
import logging

# --- Configuration ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


# --- Custom Metric Implementations (Replacement for sklearn.metrics) ---

def _get_labels(y_true, y_pred, labels_param=None):  # Renamed 'labels' to 'labels_param' to avoid conflict
    """Helper function to determine the set of labels, sorted."""
    if labels_param is None:
        present_labels_set = set()
        if isinstance(y_true, (list, np.ndarray, pd.Series)):
            present_labels_set.update(y for y in y_true if pd.notna(y))
        if isinstance(y_pred, (list, np.ndarray, pd.Series)):
            present_labels_set.update(y for y in y_pred if pd.notna(y))
        determined_labels = sorted(list(present_labels_set))
    else:
        # Ensure labels_param is a list of unique, sorted items
        if isinstance(labels_param, np.ndarray):
            determined_labels = sorted(list(set(labels_param.tolist())))
        else:
            determined_labels = sorted(list(set(labels_param)))
    return determined_labels


def confusion_matrix(y_true, y_pred, *, labels=None):  # Matched sklearn signature for used params
    """
    Computes the confusion matrix.
    C[i, j] is the number of observations known to be in group i and predicted to be in group j.
    Parameter 'labels' is keyword-only as in sklearn.
    """
    y_true_arr = np.asarray(y_true)
    y_pred_arr = np.asarray(y_pred)

    current_labels = _get_labels(y_true_arr, y_pred_arr, labels_param=labels)
    n_labels = len(current_labels)
    label_to_ind = {label: i for i, label in enumerate(current_labels)}

    cm = np.zeros((n_labels, n_labels), dtype=int)

    for true_label_val, pred_label_val in zip(y_true_arr, y_pred_arr):
        if pd.isna(true_label_val) or pd.isna(pred_label_val):
            continue
        true_idx = label_to_ind.get(true_label_val)
        pred_idx = label_to_ind.get(pred_label_val)

        if true_idx is not None and pred_idx is not None:
            cm[true_idx, pred_idx] += 1
    return cm


def accuracy_score(y_true, y_pred):  # Sklearn also has normalize=True, sample_weight=None
    """Computes the accuracy classification score."""
    y_true_arr = np.asarray(y_true)
    y_pred_arr = np.asarray(y_pred)

    if len(y_true_arr) == 0:
        return 0.0

    correct_predictions = np.sum(y_true_arr == y_pred_arr)
    return correct_predictions / len(y_true_arr)


def _handle_metric_zero_division(value, zero_division_val):
    """Handles division by zero for P/R/F1 metrics by returning a specific value."""
    if np.isinf(value) or np.isnan(value):  # Catches x/0 (inf) and 0/0 (nan)
        return float(zero_division_val)
    return float(value)


def precision_recall_fscore_support(y_true, y_pred, *, labels=None, pos_label=None, average=None,
                                    zero_division='warn'):  # Matched sklearn
    """
    Computes precision, recall, F-measure and support for each class.
    'labels', 'pos_label', 'average', 'zero_division' are keyword-only.
    Note: Script uses zero_division=0, sklearn default is 'warn'. This function respects passed 'zero_division'.
    """
    y_true_arr = np.asarray(y_true)
    y_pred_arr = np.asarray(y_pred)

    actual_zero_division_value = 0.0 if zero_division == 'warn' else float(zero_division)

    present_labels = _get_labels(y_true_arr, y_pred_arr, labels_param=labels)

    if not present_labels:
        if average is None:  # Per-class
            return np.array([]), np.array([]), np.array([]), np.array([])
        else:  # Averaged
            # Ensure float type for single metric returns if average is not None
            return float(actual_zero_division_value), float(actual_zero_division_value), float(
                actual_zero_division_value), 0

    cm_val = confusion_matrix(y_true_arr, y_pred_arr, labels=present_labels)
    n_present_labels = len(present_labels)

    tp = np.diag(cm_val)
    fp = np.sum(cm_val, axis=0) - tp
    fn = np.sum(cm_val, axis=1) - tp
    support = np.sum(cm_val, axis=1)  # This is TP + FN

    precision_arr = np.zeros(n_present_labels, dtype=float)
    recall_arr = np.zeros(n_present_labels, dtype=float)
    fscore_arr = np.zeros(n_present_labels, dtype=float)

    for i in range(n_present_labels):
        tp_i = tp[i]

        # Precision
        denominator_precision = tp_i + fp[i]
        if denominator_precision == 0:
            precision_arr[i] = actual_zero_division_value
        else:
            precision_arr[i] = tp_i / denominator_precision

        # Recall
        # denominator_recall is support[i] which is tp[i] + fn[i]
        denominator_recall = support[i]
        if denominator_recall == 0:
            recall_arr[i] = actual_zero_division_value
        else:
            recall_arr[i] = tp_i / denominator_recall

        # F-score
        denominator_fscore = precision_arr[i] + recall_arr[i]
        if denominator_fscore == 0:
            fscore_arr[i] = actual_zero_division_value
        else:
            fscore_arr[i] = (2 * precision_arr[i] * recall_arr[i]) / denominator_fscore

    # The rest of the function (handling of 'average' parameter) remains the same
    if average == 'binary':
        if pos_label is None:
            if n_present_labels == 2:
                pos_label_to_use = present_labels[1] if 1 not in present_labels or present_labels.index(1) == -1 else 1
            else:
                raise ValueError(
                    "pos_label=None is not supported for multiclass; explicitly set pos_label for binary-like cases with >2 labels.")
        else:
            pos_label_to_use = pos_label

        if pos_label_to_use not in present_labels:
            logging.warning(
                f"pos_label '{pos_label_to_use}' not found in actual labels {present_labels}. Metrics for it will be {actual_zero_division_value}.")
            return actual_zero_division_value, actual_zero_division_value, actual_zero_division_value, 0

        idx = present_labels.index(pos_label_to_use)
        return precision_arr[idx], recall_arr[idx], fscore_arr[idx], support[idx]

    elif average == 'micro':
        # Sklearn's micro-average for P/R/F1 is equivalent to accuracy
        # sum(TPi) / sum(all elements in CM)
        sum_cm_val = np.sum(cm_val)
        if sum_cm_val == 0:  # Avoid division by zero if cm_val is all zeros (e.g. no common labels)
            acc_score = actual_zero_division_value
        else:
            acc_score = np.sum(tp) / sum_cm_val
        # No need for _handle_metric_zero_division if sum_cm_val is pre-checked for zero.
        # np.sum(tp) / sum_cm_val will be NaN if sum_cm_val is 0 and np.sum(tp) is 0.
        # If actual_zero_division_value is 0, this is fine.
        # Or be more explicit:
        if sum_cm_val == 0:
            acc_score = actual_zero_division_value
        else:
            acc_score_raw = np.sum(tp) / sum_cm_val
            if np.isnan(acc_score_raw):  # Handles 0/0
                acc_score = actual_zero_division_value
            else:
                acc_score = acc_score_raw

        return acc_score, acc_score, acc_score, np.sum(support)

    elif average == 'macro':
        if len(precision_arr) == 0:
            return actual_zero_division_value, actual_zero_division_value, actual_zero_division_value, np.sum(
                support)  # support can be 0
        return np.mean(precision_arr), np.mean(recall_arr), np.mean(fscore_arr), np.sum(support)

    elif average == 'weighted':
        if np.sum(support) == 0 or len(precision_arr) == 0:
            return actual_zero_division_value, actual_zero_division_value, actual_zero_division_value, np.sum(support)
        return (np.average(precision_arr, weights=support),
                np.average(recall_arr, weights=support),
                np.average(fscore_arr, weights=support),
                np.sum(support))

    elif average is None:
        return precision_arr, recall_arr, fscore_arr, support

    else:
        raise ValueError(f"Unsupported average type: {average}")

#def precision_recall_fscore_support(y_true, y_pred, *, labels=None, pos_label=None, average=None,
#                                    zero_division='warn'):  # Matched sklearn
#    """
#    Computes precision, recall, F-measure and support for each class.
#    'labels', 'pos_label', 'average', 'zero_division' are keyword-only.
#    Note: Script uses zero_division=0, sklearn default is 'warn'. This function respects passed 'zero_division'.
#    """
#    y_true_arr = np.asarray(y_true)
#    y_pred_arr = np.asarray(y_pred)
#
#    actual_zero_division_value = 0.0 if zero_division == 'warn' else float(zero_division)
#    # In sklearn, zero_division='warn' means metric is 0.0 and a warning is issued. We'll just set to 0.0.
#    # If zero_division is explicitly 0 or 1 (numeric), that value is used.
#
#    present_labels = _get_labels(y_true_arr, y_pred_arr, labels_param=labels)
#
#    if not present_labels:
#        if average is None:  # Per-class
#            return np.array([]), np.array([]), np.array([]), np.array([])
#        else:  # Averaged
#            return actual_zero_division_value, actual_zero_division_value, actual_zero_division_value, 0
#
#    cm_val = confusion_matrix(y_true_arr, y_pred_arr, labels=present_labels)
#    n_present_labels = len(present_labels)
#
#    tp = np.diag(cm_val)
#    fp = np.sum(cm_val, axis=0) - tp
#    fn = np.sum(cm_val, axis=1) - tp
#    support = np.sum(cm_val, axis=1)
#
#    precision_arr = np.zeros(n_present_labels, dtype=float)
#    recall_arr = np.zeros(n_present_labels, dtype=float)
#    fscore_arr = np.zeros(n_present_labels, dtype=float)
#
#    for i in range(n_present_labels):
#        precision_arr[i] = _handle_metric_zero_division(tp[i] / (tp[i] + fp[i]), actual_zero_division_value)
#        recall_arr[i] = _handle_metric_zero_division(tp[i] / (tp[i] + fn[i]), actual_zero_division_value)
#        fscore_arr[i] = _handle_metric_zero_division(
#            2 * (precision_arr[i] * recall_arr[i]) / (precision_arr[i] + recall_arr[i]), actual_zero_division_value)
#
#    if average == 'binary':
#        if pos_label is None:
#            if n_present_labels == 2:  # Default to the label considered "1" or the latter if not 0/1
#                pos_label_to_use = present_labels[1] if 1 not in present_labels or present_labels.index(1) == -1 else 1
#            else:
#                raise ValueError(
#                    "pos_label=None is not supported for multiclass; explicitly set pos_label for binary-like cases with >2 labels.")
#        else:
#            pos_label_to_use = pos_label
#
#        if pos_label_to_use not in present_labels:
#            # If pos_label is not in y_true or y_pred, P/R/F1 are 0 for it.
#            # This can happen if 'labels' arg forces its consideration.
#            # Sklearn would return 0.0 for metrics of a class not present.
#            logging.warning(
#                f"pos_label '{pos_label_to_use}' not found in actual labels {present_labels}. Metrics for it will be 0.")
#            return actual_zero_division_value, actual_zero_division_value, actual_zero_division_value, 0
#
#        idx = present_labels.index(pos_label_to_use)
#        return precision_arr[idx], recall_arr[idx], fscore_arr[idx], support[idx]
#
#    elif average == 'micro':
#        micro_tp = np.sum(tp)
#        # micro_fp = np.sum(fp) # This is not how micro FP is typically calculated globally
#        # micro_fn = np.sum(fn) # This is not how micro FN is typically calculated globally
#        # Micro precision/recall are equal to accuracy if we consider all non-diagonal cells as either FP or FN for some class.
#        # Global TP = sum of TPs for each class. Global (TP+FP) = sum of all predictions for each class.
#        # Global (TP+FN) = sum of all actuals for each class.
#        # Sum of all predictions = sum of all actuals = total number of samples.
#        # Precision_micro = sum(TP) / sum(TP+FP) = sum(TP) / N
#        # Recall_micro = sum(TP) / sum(TP+FN) = sum(TP) / N
#        # So P_micro = R_micro = F1_micro = Accuracy_micro = sum(diag(CM)) / sum(CM)
#        if np.sum(
#            support) == 0: return actual_zero_division_value, actual_zero_division_value, actual_zero_division_value, 0
#        # For strict P/R/F1 micro based on sum of TP/FP/FN:
#        # total_tp = np.sum(tp)
#        # total_fp = np.sum(fp) # Sum of all FPs across classes
#        # total_fn = np.sum(fn) # Sum of all FNs across classes
#        # p_micro = _handle_metric_zero_division(total_tp / (total_tp + total_fp), actual_zero_division_value)
#        # r_micro = _handle_metric_zero_division(total_tp / (total_tp + total_fn), actual_zero_division_value)
#        # f1_micro = _handle_metric_zero_division(2 * (p_micro * r_micro) / (p_micro + r_micro), actual_zero_division_value)
#        # return p_micro, r_micro, f1_micro, np.sum(support)
#        # Sklearn's micro-average is equivalent to accuracy for P/R/F1 if calculated on total TP,FP,FN
#        # P_micro = sum(TPi) / sum(TPi+FPi) = sum(diag(CM)) / sum(all elements in CM)
#        # R_micro = sum(TPi) / sum(TPi+FNi) = sum(diag(CM)) / sum(all elements in CM)
#        # F1_micro will also be this value.
#        # This is effectively accuracy.
#        acc_score = _handle_metric_zero_division(np.sum(tp) / np.sum(cm_val), actual_zero_division_value) if np.sum(
#            cm_val) > 0 else actual_zero_division_value
#        return acc_score, acc_score, acc_score, np.sum(support)
#
#
#    elif average == 'macro':
#        if len(
#            precision_arr) == 0: return actual_zero_division_value, actual_zero_division_value, actual_zero_division_value, 0
#        return np.mean(precision_arr), np.mean(recall_arr), np.mean(fscore_arr), np.sum(support)
#
#    elif average == 'weighted':
#        if np.sum(
#            support) == 0: return actual_zero_division_value, actual_zero_division_value, actual_zero_division_value, 0
#        if len(
#            precision_arr) == 0: return actual_zero_division_value, actual_zero_division_value, actual_zero_division_value, 0
#        return (np.average(precision_arr, weights=support),
#                np.average(recall_arr, weights=support),
#                np.average(fscore_arr, weights=support),
#                np.sum(support))
#
#    elif average is None:
#        return precision_arr, recall_arr, fscore_arr, support
#
#    else:
#        raise ValueError(f"Unsupported average type: {average}")


def precision_score(y_true, y_pred, *, labels=None, pos_label=1, average='binary',
                    zero_division='warn'):  # Matched sklearn
    p, _, _, _ = precision_recall_fscore_support(y_true, y_pred, labels=labels, pos_label=pos_label, average=average,
                                                 zero_division=zero_division)
    return p


def recall_score(y_true, y_pred, *, labels=None, pos_label=1, average='binary',
                 zero_division='warn'):  # Matched sklearn
    _, r, _, _ = precision_recall_fscore_support(y_true, y_pred, labels=labels, pos_label=pos_label, average=average,
                                                 zero_division=zero_division)
    return r


def f1_score(y_true, y_pred, *, labels=None, pos_label=1, average='binary', zero_division='warn'):  # Matched sklearn
    _, _, f1, _ = precision_recall_fscore_support(y_true, y_pred, labels=labels, pos_label=pos_label, average=average,
                                                  zero_division=zero_division)
    return f1


def cohen_kappa_score(y1, y2, *, labels=None):  # Sklearn also has weights=None, sample_weight=None
    """Computes Cohen's kappa, a score that measures inter-rater agreement."""
    y1_arr = np.asarray(y1)
    y2_arr = np.asarray(y2)

    if len(y1_arr) != len(y2_arr):
        raise ValueError("Input arrays must have the same length.")
    if len(y1_arr) == 0:  # Consistent with sklearn, though script handles this before call
        return np.nan

    current_labels = _get_labels(y1_arr, y2_arr, labels_param=labels)
    if not current_labels:
        # This case (no labels, e.g. from two empty lists or lists of only NaNs)
        # would lead to an empty confusion matrix. Sklearn returns nan.
        return np.nan

    cm_val = confusion_matrix(y1_arr, y2_arr, labels=current_labels)
    n = np.sum(cm_val)
    if n == 0:  # If inputs were all NaNs that got filtered, or cm is all zeros.
        return np.nan  # No actual ratings to compare

    p_o = np.sum(np.diag(cm_val)) / n

    sum_rows = np.sum(cm_val, axis=1)
    sum_cols = np.sum(cm_val, axis=0)
    p_e = np.sum((sum_rows / n) * (sum_cols / n))

    if abs(1.0 - p_e) < 1e-12:  # Denominator is effectively zero (p_e is 1)
        # Sklearn behavior: if p_e is 1, kappa is 1 if p_o is also 1, else 0.
        return 1.0 if abs(p_o - p_e) < 1e-12 else 0.0

    kappa = (p_o - p_e) / (1 - p_e)
    return kappa