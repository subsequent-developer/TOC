export type VerdictType = 'NORMAL' | 'RULE_VIOLATION' | 'STATISTICAL_ANOMALY' | 'VALID_INCOMPLETE';
export type SeverityType = 'CRITICAL' | 'WARNING' | 'INFO';
export type AnomalyCategoryType = 'RULE_VIOLATION' | 'STATISTICAL_ANOMALY';
export type InputFormatType = 'DELIMITED_STRING' | 'EVENT_LIST';

export interface FsmErrorDetail {
  error_type: 'TERMINAL_STATE_VIOLATION' | 'UNKNOWN_EVENT' | 'INVALID_TRANSITION' | string;
  failed_step: number;
  failed_event: string;
  state_at_failure: string;
  allowed_events: string[];
}

export interface FsmEvaluation {
  is_rule_valid: boolean;
  is_complete: boolean;
  final_state: string;
  total_steps: number;
  successful_transitions: number;
  error: FsmErrorDetail | null;
}

export interface MlEvaluation {
  prediction: 'NORMAL' | 'ANOMALY';
  is_ml_anomaly: boolean;
  anomaly_score: number;
  raw_decision_score: number;
  features: Record<string, number>;
}

export interface Diagnostics {
  severity: SeverityType;
  root_cause: string;
  key_factors: string[];
  recommended_action: string;
}

export interface AnalysisRecord {
  id: number;
  order_id: string | null;
  input_format: InputFormatType;
  raw_input_payload: string | string[];
  verdict: VerdictType;
  is_anomaly: boolean;
  anomaly_type: AnomalyCategoryType | null;
  summary: string;
  fsm_evaluation: FsmEvaluation;
  ml_evaluation: MlEvaluation | null;
  ml_skip_reason: string | null;
  diagnostics: Diagnostics;
  created_at: string;
}

export interface PaginatedAnalysesResponse {
  items: AnalysisRecord[];
  total: number;
  skip: number;
  limit: number;
}

export interface BatchSummaryMetrics {
  total_orders: number;
  normal_count: number;
  rule_violation_count: number;
  statistical_anomaly_count: number;
  valid_incomplete_count: number;
  total_anomalies: number;
  anomaly_rate: number;
}

export interface BatchAnalysisResponse {
  results: AnalysisRecord[];
  summary: BatchSummaryMetrics;
}

export interface OrderHistoryResponse {
  order_id: string;
  returned_count: number;
  analyses: AnalysisRecord[];
}

export interface DatabaseSummaryMetrics {
  total_analyses: number;
  normal_count: number;
  rule_violation_count: number;
  statistical_anomaly_count: number;
  valid_incomplete_count: number;
  total_anomalies: number;
  anomaly_rate: number;
  unique_orders_count: number;
}

export interface ReadinessResponse {
  service_status: string;
  dataset_spec_version: string;
  model_artifact_path: string;
  model_artifact_exists: boolean;
  supported_verdicts: string[];
}

export interface LivenessResponse {
  status: string;
}

export interface WorkflowAnalysisRequest {
  order_id?: string | null;
  event_sequence: string | string[];
}

export interface TraceItemRequest {
  order_id?: string | null;
  event_sequence: string | string[];
}

export interface BatchAnalysisRequest {
  traces: Array<TraceItemRequest | string | string[]>;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
