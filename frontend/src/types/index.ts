export interface ModelMetrics {
  name: string
  description: string
  accuracy: number
  precision_real: number
  recall_real: number
  f1_real: number
  precision_fake: number
  recall_fake: number
  f1_fake: number
  test_samples: number
  confusion_matrix: {
    true_positive: number
    true_negative: number
    false_positive: number
    false_negative: number
  }
}

export interface TopEntity {
  name: string
  connections: number
  dominant_class: string
  fake_ratio: number
}

export interface Metrics {
  text_only_model: ModelMetrics
  graph_enhanced_model: ModelMetrics
  knowledge_graph: {
    total_nodes: number
    total_edges: number
    avg_entities_per_article: number
    entity_types: string[]
    top_entities: TopEntity[]
  }
  dataset: {
    total_articles: number
    fake_articles: number
    real_articles: number
    train_samples: number
    test_samples: number
    features_tfidf: number
    features_graph: number
    features_total: number
  }
  training_config: {
    classifier: string
    max_iter: number
    random_state: number
    tfidf_max_features: number
    tfidf_max_df: number
    train_test_split: number
    stratified: boolean
  }
}

export interface GraphFeatures {
  num_entities: number
  num_edges: number
  avg_degree: number
  density: number
  fake_ratio: number
}

export interface SampleResponse {
  headline: string
  content: string
  label: string
}

export interface PredictResponse {
  label: string
  is_fake: boolean
  confidence: number
  entities_detected: string[]
  graph_features: GraphFeatures
  message: string
}
