import pandas as pd
import numpy as np
import logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def _get_labels(y_true, y_pred, labels_param=None):
""Helper function to determine the set of labels, sorted."""
    if labels_param is None:
        present_labels_set = set()
        if isinstance(y_true, (list, np.ndarray, pd.Series)):
            present_labels_set.update(y for y in y_true if pd.notna(y))
        if isinstance(y_pred, (list, np.ndarray, pd.Series)):
            present_labels_set.update(y for y in y_pred if pd.notna(y))
        determined_labels = sorted(list(present_labels_set))
    else:
        if isinstance(labels_param, np.ndarray):
            determined_labels = sorted(list(set(labels_param.tolist())))
        else:
            determined_labels = sorted(list(set(labels_param)))
    return determined_labels

def confusion_matrix(y_true, y_pred, *, labels=None):
""
    Computes the confusion matrix.
    C[i, j] is the number of observations known to be in group i and predicted to be in group j.
    Parameter 'labels' is keyword-only as in sklearn.
""
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

def accuracy_score(y_true, y_pred):
""Computes the accuracy classification score."""
    y_true_arr = np.asarray(y_true)
    y_pred_arr = np.asarray(y_pred)

    if len(y_true_arr) == 0:
        return 0.0

    correct_predictions = np.sum(y_true_arr == y_pred_arr)
    return correct_predictions / len(y_true_arr)

def _handle_metric_zero_division(value, zero_division_val):
""Handles division by zero for P/R/F1 metrics by returning a specific value."""
    if np.isinf(value) or np.isnan(value):
        return float(zero_division_val)
    return float(value)

def precision_recall_fscore_support(y_true, y_pred, *, labels=None, pos_label=None, average=None,
                                    zero_division='warn'):
""
    Computes precision, recall, F-measure and support for each class.
labels', 'pos_label', 'average', 'zero_division' are keyword-only.
    Note: Script uses zero_division=0, sklearn default is 'warn'. This function respects passed 'zero_division'.
""
    y_true_arr = np.asarray(y_true)
    y_pred_arr = np.asarray(y_pred)

    actual_zero_division_value = 0.0 if zero_division == 'warn' else float(zero_division)

    present_labels = _get_labels(y_true_arr, y_pred_arr, labels_param=labels)

    if not present_labels:
        if average is None:
            return np.array([]), np.array([]), np.array([]), np.array([])
        else:
            return float(actual_zero_division_value), float(actual_zero_division_value), float(
                actual_zero_division_value), 0

    cm_val = confusion_matrix(y_true_arr, y_pred_arr, labels=present_labels)
    n_present_labels = len(present_labels)

    tp = np.diag(cm_val)
    fp = np.sum(cm_val, axis=0) - tp
    fn = np.sum(cm_val, axis=1) - tp
    support = np.sum(cm_val, axis=1)

    precision_arr = np.zeros(n_present_labels, dtype=float)
    recall_arr = np.zeros(n_present_labels, dtype=float)
    fscore_arr = np.zeros(n_present_labels, dtype=float)

    for i in range(n_present_labels):
        tp_i = tp[i]
        denominator_precision = tp_i + fp[i]
        if denominator_precision == 0:
            precision_arr[i] = actual_zero_division_value
        else:
            precision_arr[i] = tp_i / denominator_precision
        denominator_recall = support[i]
        if denominator_recall == 0:
            recall_arr[i] = actual_zero_division_value
        else:
            recall_arr[i] = tp_i / denominator_recall
        denominator_fscore = precision_arr[i] + recall_arr[i]
        if denominator_fscore == 0:
            fscore_arr[i] = actual_zero_division_value
        else:
            fscore_arr[i] = (2 * precision_arr[i] * recall_arr[i]) / denominator_fscore
    if average == 'binary':
        if pos_label is None:
            if n_present_labels == 2:
                pos_label_to_use = present_labels[1] if 1 not in present_labels or present_labels.index(1) == -1 else 1
            else:
                raise ValueError(
pos_label=None is not supported for multiclass; explicitly set pos_label for binary-like cases with >2 labels.")
        else:
            pos_label_to_use = pos_label

        if pos_label_to_use not in present_labels:
            logging.warning(
pos_label '{pos_label_to_use}' not found in actual labels {present_labels}. Metrics for it will be {actual_zero_division_value}.")
            return actual_zero_division_value, actual_zero_division_value, actual_zero_division_value, 0

        idx = present_labels.index(pos_label_to_use)
        return precision_arr[idx], recall_arr[idx], fscore_arr[idx], support[idx]

    elif average == 'micro':
        sum_cm_val = np.sum(cm_val)
        if sum_cm_val == 0:
            acc_score = actual_zero_division_value
        else:
            acc_score = np.sum(tp) / sum_cm_val
        if sum_cm_val == 0:
            acc_score = actual_zero_division_value
        else:
            acc_score_raw = np.sum(tp) / sum_cm_val
            if np.isnan(acc_score_raw):
                acc_score = actual_zero_division_value
            else:
                acc_score = acc_score_raw

        return acc_score, acc_score, acc_score, np.sum(support)

    elif average == 'macro':
        if len(precision_arr) == 0:
            return actual_zero_division_value, actual_zero_division_value, actual_zero_division_value, np.sum(
                support)
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

def precision_score(y_true, y_pred, *, labels=None, pos_label=1, average='binary',
                    zero_division='warn'):
    p, _, _, _ = precision_recall_fscore_support(y_true, y_pred, labels=labels, pos_label=pos_label, average=average,
                                                 zero_division=zero_division)
    return p

def recall_score(y_true, y_pred, *, labels=None, pos_label=1, average='binary',
                 zero_division='warn'):
    _, r, _, _ = precision_recall_fscore_support(y_true, y_pred, labels=labels, pos_label=pos_label, average=average,
                                                 zero_division=zero_division)
    return r

def f1_score(y_true, y_pred, *, labels=None, pos_label=1, average='binary', zero_division='warn'):
    _, _, f1, _ = precision_recall_fscore_support(y_true, y_pred, labels=labels, pos_label=pos_label, average=average,
                                                  zero_division=zero_division)
    return f1

def cohen_kappa_score(y1, y2, *, labels=None):
""Computes Cohen's kappa, a score that measures inter-rater agreement."""
    y1_arr = np.asarray(y1)
    y2_arr = np.asarray(y2)

    if len(y1_arr) != len(y2_arr):
        raise ValueError("Input arrays must have the same length.")
    if len(y1_arr) == 0:
        return np.nan

    current_labels = _get_labels(y1_arr, y2_arr, labels_param=labels)
    if not current_labels:
        return np.nan

    cm_val = confusion_matrix(y1_arr, y2_arr, labels=current_labels)
    n = np.sum(cm_val)
    if n == 0:
        return np.nan

    p_o = np.sum(np.diag(cm_val)) / n

    sum_rows = np.sum(cm_val, axis=1)
    sum_cols = np.sum(cm_val, axis=0)
    p_e = np.sum((sum_rows / n) * (sum_cols / n))

    if abs(1.0 - p_e) < 1e-12:
        return 1.0 if abs(p_o - p_e) < 1e-12 else 0.0

    kappa = (p_o - p_e) / (1 - p_e)
    return kappa