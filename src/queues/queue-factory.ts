import { Queue } from 'bullmq';
import { connection } from '../redis';
import { QUEUE_NAMES, JOB_CONFIG } from '../constants';

export const createJobOptions = () => ({
  removeOnComplete: JOB_CONFIG.REMOVE_ON_COMPLETE,
  removeOnFail: JOB_CONFIG.REMOVE_ON_FAIL,
  attempts: JOB_CONFIG.ATTEMPTS,
  backoff: {
    type: JOB_CONFIG.BACKOFF_TYPE,
    delay: JOB_CONFIG.BACKOFF_DELAY,
  },
});

export const splitterQueue = new Queue(QUEUE_NAMES.SPLITTER, { connection });
export const insertionQueue = new Queue(QUEUE_NAMES.INSERTION, { connection });
