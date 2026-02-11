export const QUEUE_NAMES = {
  SPLITTER: 'csv-splitter',
  INSERTION: 'db-insertion',
} as const;

export const JOB_CONFIG = {
  REMOVE_ON_COMPLETE: true,
  REMOVE_ON_FAIL: 1000,
  ATTEMPTS: 3,
  BACKOFF_TYPE: 'exponential' as const,
  BACKOFF_DELAY: 1000,
};

export const PROCESSING_CONFIG = {
  BATCH_SIZE: 1000,
  INSERTION_CONCURRENCY: 5,
};

export const UPLOAD_CONFIG = {
  DESTINATION: 'uploads/',
};
