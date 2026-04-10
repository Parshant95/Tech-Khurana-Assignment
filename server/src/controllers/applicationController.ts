import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import Application from '../models/Application';

const STATUS_VALUES = ['Applied', 'Phone Screen', 'Interview', 'Offer', 'Rejected'] as const;

const applicationSchema = z.object({
  company: z.string().min(1, 'Company is required').trim(),
  role: z.string().min(1, 'Role is required').trim(),
  jdLink: z.string().trim().optional(),
  notes: z.string().optional(),
  dateApplied: z.string().optional(),
  status: z.enum(STATUS_VALUES).optional(),
  salaryRange: z.string().optional(),
  skills: z.array(z.string()).optional(),
  niceToHaveSkills: z.array(z.string()).optional(),
  seniority: z.string().optional(),
  location: z.string().optional(),
  resumeSuggestions: z.array(z.string()).optional(),
});

export const getApplications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const applications = await Application.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ applications });
  } catch (err) {
    next(err);
  }
};

export const createApplication = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = applicationSchema.parse(req.body);
    const application = await Application.create({ ...data, userId: req.userId });
    res.status(201).json({ application });
  } catch (err) {
    next(err);
  }
};

export const updateApplication = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = applicationSchema.partial().parse(req.body);
    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      data,
      { new: true, runValidators: true }
    );
    if (!application) {
      res.status(404).json({ message: 'Application not found' });
      return;
    }
    res.json({ application });
  } catch (err) {
    next(err);
  }
};

export const deleteApplication = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!application) {
      res.status(404).json({ message: 'Application not found' });
      return;
    }
    res.json({ message: 'Application deleted successfully' });
  } catch (err) {
    next(err);
  }
};
