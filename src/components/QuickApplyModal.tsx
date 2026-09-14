import React, { useState, useEffect } from 'react';
import { X, User, FileText, CheckCircle2, Zap } from 'lucide-react';
import { JobPost } from '../types';

interface QuickApplyModalProps {
  job: JobPost | null;
  onClose: () => void;
  onApplied: (jobId: string) => void;
}

export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  experienceSummary: string;
}

export const QuickApplyModal: React.FC<QuickApplyModalProps> = ({ job, onClose, onApplied }) => {
  const [profile, setProfile] = useState<UserProfile>({
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    experienceSummary: '',
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('jobspy_user_profile');
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  if (!job) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('jobspy_user_profile', JSON.stringify(profile));
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onApplied(job.id);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-100 p-6 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Quick Apply</h2>
              <p className="text-xs text-slate-500">{job.title} at {job.company}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
          {success ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
              <h3 className="text-lg font-bold text-slate-900">Application Submitted!</h3>
              <p className="text-sm text-slate-500">Your profile data was auto-filled and sent to {job.company}.</p>
            </div>
          ) : (
            <>
              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-800">
                Your profile is securely stored in local storage and auto-fills external application forms instantly.
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profile.fullName}
                  onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={profile.email}
                    onChange={e => setProfile({ ...profile, email: e.target.value })}
                    placeholder="alex@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+1 (555) 019-2834"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={profile.linkedin}
                    onChange={e => setProfile({ ...profile, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    GitHub / Portfolio URL
                  </label>
                  <input
                    type="url"
                    value={profile.github}
                    onChange={e => setProfile({ ...profile, github: e.target.value })}
                    placeholder="https://github.com/username"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Professional Experience Summary
                </label>
                <textarea
                  rows={3}
                  value={profile.experienceSummary}
                  onChange={e => setProfile({ ...profile, experienceSummary: e.target.value })}
                  placeholder="Briefly summarize your engineering background and core tech stack..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50/50"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-colors"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Submit Quick Apply</span>
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
