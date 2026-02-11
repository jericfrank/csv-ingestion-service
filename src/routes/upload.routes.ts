import { Router, Request, Response } from 'express';
import multer from 'multer';
import { splitterQueue, createJobOptions } from '../queues/queue-factory';
import { UPLOAD_CONFIG } from '../constants';
import { AppError, handleError } from '../utils/error-handler';
import { logger } from '../utils/logger';

const router = Router();
const upload = multer({ dest: UPLOAD_CONFIG.DESTINATION });

router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  const context = 'UPLOAD_ROUTE';

  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const { path: filePath, originalname: originalName } = req.file;

    logger.info(context, `File upload received`, {
      filename: originalName,
      size: req.file.size,
    });

    await splitterQueue.add(
      'split-csv',
      { filePath, originalName, startTime: Date.now() },
      createJobOptions()
    );

    logger.info(context, `Job enqueued successfully`, { filename: originalName });

    res.json({
      message: 'Processing started',
      file: originalName,
    });
  } catch (error) {
    handleError(error, res, context);
  }
});

export default router;
