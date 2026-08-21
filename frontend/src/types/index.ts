export interface RenderLog {
  frame_id: string;
  scene_name: string;
  episode: string;
  sequence_id: string;
  render_time_ms: number;
  cost_usd: number;
  status: 'COMPLETED' | 'HIGH_LATENCY' | 'FAILED' | 'BOTTLENECK' | 'OPTIMIZED' | string;
  tags: string[] | string;
  gpu_util_pct: number;
  memory_gb: number;
  vram_allocated_gb: number;
  error_type: string;
  worker_node: string;
  created_at: string;
}

export interface TelemetryStats {
  total_frames: number;
  avg_render_time_ms: number;
  avg_render_time_sec: number;
  total_cost_usd: number;
  high_latency_frames: number;
  failed_frames: number;
  failure_rate_pct: number;
  anomaly_rate_pct: number;
  active_worker_nodes: number;
  query_metadata?: {
    engine: string;
    latency_ms: number;
  };
}

export interface SceneTelemetry {
  scene_name: string;
  total_frames: number;
  avg_render_time_ms: number;
  avg_render_time_sec: number;
  total_cost_usd: number;
  high_latency_count: number;
  status: 'OPTIMAL' | 'MODERATE_LATENCY' | 'CRITICAL_BOTTLENECK';
}

export interface ExecutionStep {
  step_number?: number;
  step_name?: string;
  title?: string;
  tool?: string;
  reasoning?: string;
  query?: string;
  findings?: string;
  action_type?: 'SQL_QUERY' | 'GEMINI_REASONING' | 'DATABASE_WRITEBACK' | 'EXECUTIVE_SUMMARY' | string;
  status?: 'COMPLETED' | 'RUNNING' | 'FAILED' | string;
  details?: Record<string, any>;
  timestamp_ms?: number;
}

export interface RecommendationItem {
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
  action: string;
  estimated_speedup?: string;
  target_scene?: string;
}

export interface AgentRunResponse {
  prompt: string;
  status: string;
  execution_time_ms?: number;
  execution_time_sec?: number | string;
  model_used: string;
  steps?: ExecutionStep[];
  execution_trace?: ExecutionStep[];
  summary?: {
    total_frames_analyzed?: number;
    frames_analyzed?: number;
    bottlenecks_detected?: number;
    bottlenecks_identified?: number;
    frames_tagged?: number;
    estimated_cost_reduction_usd?: number;
    primary_bottleneck?: string;
    system_health?: string;
  };
  recommendations?: RecommendationItem[];
  affected_frames?: string[];
}

export interface SystemHealth {
  status: string;
  gemini: {
    configured: boolean;
    model: string;
    mode: string;
  };
  clickhouse: {
    is_connected_to_remote: boolean;
    host: string;
    port: number;
    database: string;
    mode: string;
  };
  database_ready: boolean;
  has_records: boolean;
}
