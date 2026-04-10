import mongoose, { Document, Schema } from 'mongoose';

export type ApplicationStatus = 'Applied' | 'Phone Screen' | 'Interview' | 'Offer' | 'Rejected';

export interface IApplication extends Document {
  userId: mongoose.Types.ObjectId;
  company: string;
  role: string;
  jdLink?: string;
  notes?: string;
  dateApplied: Date;
  status: ApplicationStatus;
  salaryRange?: string;
  skills: string[];
  niceToHaveSkills: string[];
  seniority?: string;
  location?: string;
  resumeSuggestions: string[];
}

const applicationSchema = new Schema<IApplication>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    jdLink: { type: String, trim: true },
    notes: { type: String },
    dateApplied: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['Applied', 'Phone Screen', 'Interview', 'Offer', 'Rejected'],
      default: 'Applied',
    },
    salaryRange: { type: String },
    skills: { type: [String], default: [] },
    niceToHaveSkills: { type: [String], default: [] },
    seniority: { type: String },
    location: { type: String },
    resumeSuggestions: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<IApplication>('Application', applicationSchema);
