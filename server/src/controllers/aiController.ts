import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { parseJobDescription, generateResumeSuggestions } from '../services/openaiService';

const parseSchema = z.object({
  jobDescription: z.string().min(50, 'Job description must be at least 50 characters'),
});

export const parseJD = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { jobDescription } = parseSchema.parse(req.body);

    const parsed = await parseJobDescription(jobDescription);
    const suggestions = await generateResumeSuggestions(parsed);

    res.json({ parsed, suggestions });
  } catch (err) {
    next(err);
  }
};
