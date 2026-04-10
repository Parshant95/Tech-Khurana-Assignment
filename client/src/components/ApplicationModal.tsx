import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { X, Trash2, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Application, ApplicationStatus, KANBAN_COLUMNS } from '../types';
import * as applicationsApi from '../api/applications';
import * as aiApi from '../api/ai';
import ResumeSuggestions from './ResumeSuggestions';

interface FormState {
  company: string;
  role: string;
  jdLink: string;
  notes: string;
  dateApplied: string;
  status: ApplicationStatus;
  salaryRange: string;
  skills: string[];
  niceToHaveSkills: string[];
  seniority: string;
  location: string;
  resumeSuggestions: string[];
}

const defaultForm = (): FormState => ({
  company: '',
  role: '',
  jdLink: '',
  notes: '',
  dateApplied: new Date().toISOString().split('T')[0],
  status: 'Applied',
  salaryRange: '',
  skills: [],
  niceToHaveSkills: [],
  seniority: '',
  location: '',
  resumeSuggestions: [],
});

interface Props {
  app?: Application | null;
  onClose: () => void;
}

export default function ApplicationModal({ app, onClose }: Props) {
  const isNew = app === null;
  const [form, setForm] = useState<FormState>(defaultForm());
  const [isEditing, setIsEditing] = useState(isNew);
  const [jdText, setJdText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [showParser, setShowParser] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (app) {
      setForm({
        company: app.company,
        role: app.role,
        jdLink: app.jdLink ?? '',
        notes: app.notes ?? '',
        dateApplied: new Date(app.dateApplied).toISOString().split('T')[0],
        status: app.status,
        salaryRange: app.salaryRange ?? '',
        skills: app.skills ?? [],
        niceToHaveSkills: app.niceToHaveSkills ?? [],
        seniority: app.seniority ?? '',
        location: app.location ?? '',
        resumeSuggestions: app.resumeSuggestions ?? [],
      });
    }
  }, [app]);

  const createMutation = useMutation({
    mutationFn: applicationsApi.createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application added!');
      onClose();
    },
    onError: () => toast.error('Failed to save application'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Application> }) =>
      applicationsApi.updateApplication(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application updated!');
      setIsEditing(false);
    },
    onError: () => toast.error('Failed to update application'),
  });

  const deleteMutation = useMutation({
    mutationFn: applicationsApi.deleteApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application deleted');
      onClose();
    },
    onError: () => toast.error('Failed to delete application'),
  });

  const handleParse = async () => {
    if (!jdText.trim()) return;
    setIsParsing(true);
    try {
      const { parsed, suggestions } = await aiApi.parseJobDescription(jdText);
      setForm((prev) => ({
        ...prev,
        company: parsed.company || prev.company,
        role: parsed.role || prev.role,
        skills: parsed.skills.length ? parsed.skills : prev.skills,
        niceToHaveSkills: parsed.niceToHaveSkills.length
          ? parsed.niceToHaveSkills
          : prev.niceToHaveSkills,
        seniority: parsed.seniority || prev.seniority,
        location: parsed.location || prev.location,
        resumeSuggestions: suggestions,
      }));
      setShowParser(false);
      setJdText('');
      toast.success('JD parsed! Fields have been filled in.');
    } catch {
      toast.error('Failed to parse job description. Please try again.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNew) {
      createMutation.mutate(form);
    } else if (app) {
      updateMutation.mutate({ id: app._id, data: form });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {isNew ? 'Add Application' : isEditing ? 'Edit Application' : app?.company + ' — ' + app?.role}
          </h2>
          <div className="flex items-center gap-2">
            {!isNew && !isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Delete this application?')) {
                      deleteMutation.mutate(app!._id);
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* AI Parser (only in edit/create mode) */}
          {isEditing && (
            <div className="border border-dashed border-purple-300 rounded-xl bg-purple-50/50">
              <button
                type="button"
                onClick={() => setShowParser(!showParser)}
                className="flex items-center gap-2 w-full px-4 py-3 text-purple-700 font-medium text-sm"
              >
                <span>AI Job Description Parser</span>
                <span className="ml-auto text-purple-400">
                  {showParser ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </button>
              {showParser && (
                <div className="px-4 pb-4 space-y-3">
                  <textarea
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    placeholder="Paste the full job description here and click Parse..."
                    rows={6}
                    className="w-full px-3 py-2 text-sm border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white resize-none"
                  />
                  <button
                    type="button"
                    onClick={handleParse}
                    disabled={isParsing || !jdText.trim()}
                    className="w-full py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isParsing ? 'Parsing with AI...' : 'Parse with AI'}
                  </button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} id="app-form" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Company" required>
                {isEditing ? (
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
                    required
                    className={inputClass}
                    placeholder="Acme Corp"
                  />
                ) : (
                  <p className="text-gray-800 font-medium">{form.company}</p>
                )}
              </Field>
              <Field label="Role" required>
                {isEditing ? (
                  <input
                    type="text"
                    value={form.role}
                    onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                    required
                    className={inputClass}
                    placeholder="Software Engineer"
                  />
                ) : (
                  <p className="text-gray-800 font-medium">{form.role}</p>
                )}
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Status">
                {isEditing ? (
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, status: e.target.value as ApplicationStatus }))
                    }
                    className={inputClass}
                  >
                    {KANBAN_COLUMNS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                ) : (
                  <StatusBadge status={form.status} />
                )}
              </Field>
              <Field label="Date Applied">
                {isEditing ? (
                  <input
                    type="date"
                    value={form.dateApplied}
                    onChange={(e) => setForm((p) => ({ ...p, dateApplied: e.target.value }))}
                    className={inputClass}
                  />
                ) : (
                  <p className="text-gray-700">
                    {new Date(form.dateApplied).toLocaleDateString()}
                  </p>
                )}
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Location">
                {isEditing ? (
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                    className={inputClass}
                    placeholder="Remote, New York, etc."
                  />
                ) : (
                  <p className="text-gray-700">{form.location || '—'}</p>
                )}
              </Field>
              <Field label="Seniority">
                {isEditing ? (
                  <input
                    type="text"
                    value={form.seniority}
                    onChange={(e) => setForm((p) => ({ ...p, seniority: e.target.value }))}
                    className={inputClass}
                    placeholder="Senior, Mid-level, etc."
                  />
                ) : (
                  <p className="text-gray-700">{form.seniority || '—'}</p>
                )}
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Salary Range">
                {isEditing ? (
                  <input
                    type="text"
                    value={form.salaryRange}
                    onChange={(e) => setForm((p) => ({ ...p, salaryRange: e.target.value }))}
                    className={inputClass}
                    placeholder="$80k – $100k"
                  />
                ) : (
                  <p className="text-gray-700">{form.salaryRange || '—'}</p>
                )}
              </Field>
              <Field label="JD Link">
                {isEditing ? (
                  <input
                    type="url"
                    value={form.jdLink}
                    onChange={(e) => setForm((p) => ({ ...p, jdLink: e.target.value }))}
                    className={inputClass}
                    placeholder="https://..."
                  />
                ) : form.jdLink ? (
                  <a
                    href={form.jdLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                  >
                    View JD <ExternalLink size={12} />
                  </a>
                ) : (
                  <p className="text-gray-700">—</p>
                )}
              </Field>
            </div>

            <SkillsField
              label="Required Skills"
              skills={form.skills}
              isEditing={isEditing}
              color="blue"
              onAdd={(v) => setForm((p) => ({ ...p, skills: [...p.skills, v] }))}
              onRemove={(i) =>
                setForm((p) => ({ ...p, skills: p.skills.filter((_, idx) => idx !== i) }))
              }
            />

            <SkillsField
              label="Nice-to-Have Skills"
              skills={form.niceToHaveSkills}
              isEditing={isEditing}
              color="violet"
              onAdd={(v) => setForm((p) => ({ ...p, niceToHaveSkills: [...p.niceToHaveSkills, v] }))}
              onRemove={(i) =>
                setForm((p) => ({
                  ...p,
                  niceToHaveSkills: p.niceToHaveSkills.filter((_, idx) => idx !== i),
                }))
              }
            />

            <Field label="Notes">
              {isEditing ? (
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  rows={3}
                  className={`${inputClass} resize-none`}
                  placeholder="Recruiter name, referral, impressions..."
                />
              ) : (
                <p className="text-gray-700 text-sm whitespace-pre-wrap">
                  {form.notes || '—'}
                </p>
              )}
            </Field>

            {form.resumeSuggestions.length > 0 && (
              <ResumeSuggestions suggestions={form.resumeSuggestions} />
            )}
          </form>
        </div>

        {/* Footer actions */}
        {isEditing && (
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
            {!isNew && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              form="app-form"
              disabled={isSaving}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? 'Saving...' : isNew ? 'Add Application' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition';

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  Applied: 'bg-blue-100 text-blue-700',
  'Phone Screen': 'bg-yellow-100 text-yellow-700',
  Interview: 'bg-purple-100 text-purple-700',
  Offer: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={`inline-block px-3 py-1 text-sm rounded-full font-medium ${STATUS_COLORS[status]}`}>
      {status}
    </span>
  );
}

interface SkillsFieldProps {
  label: string;
  skills: string[];
  isEditing: boolean;
  color: 'blue' | 'violet';
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
}

function SkillsField({ label, skills, isEditing, color, onAdd, onRemove }: SkillsFieldProps) {
  const [input, setInput] = useState('');

  const tagClass =
    color === 'blue'
      ? 'bg-blue-50 text-blue-700 border-blue-100'
      : 'bg-violet-50 text-violet-700 border-violet-100';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = input.trim();
      if (value && !skills.includes(value)) {
        onAdd(value);
        setInput('');
      }
    }
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {skills.map((skill, i) => (
            <span
              key={i}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-full border font-medium ${tagClass}`}
            >
              {skill}
              {isEditing && (
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  className="opacity-60 hover:opacity-100"
                >
                  <X size={10} />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
      {isEditing && (
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a skill and press Enter"
          className={inputClass}
        />
      )}
      {!isEditing && skills.length === 0 && <p className="text-gray-400 text-sm">—</p>}
    </div>
  );
}
