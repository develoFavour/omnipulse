export interface TransmissionItem {
  text: string;
  latency: string;
  channel: string;
}

export interface FeatureStat {
  value: string;
  label: string;
}

export interface FeatureItem {
  id: string;
  tag: string;
  headline: string;
  body: string;
  stats: FeatureStat[];
}

export interface PipelineStep {
  step: string;
  tag: string;
  title: string;
  body: string;
  tags: [string, string];
}

export interface ComparisonRow {
  feature: string;
  omni: string;
  legacy: string;
}

export interface BenchmarkStat {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  color?: string;
}
