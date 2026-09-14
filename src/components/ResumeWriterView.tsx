import React, { useState, useEffect } from 'react';
import { Sparkles, FileText, Download, Copy, Check, User, Briefcase, Award } from 'lucide-react';
import { JobPost } from '../types';
import { UserProfile } from './QuickApplyModal';

interface ResumeWriterViewProps {
  savedJobs: JobPost[];
}

export const ResumeWriterView: React.FC<ResumeWriterViewProps> = ({ savedJobs }) => {
  const [profile, setProfile] = useState<UserProfile>({
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    experienceSummary: '',
  });
  const [selectedJobId, setSelectedJobId] = useState<string>(savedJobs[0]?.id || '');
  const [targetRole, setTargetRole] = useState<string>('');
  const [targetCompany, setTargetCompany] = useState<string>('');
  const [customJobDesc, setCustomJobDesc] = useState<string>('');
  const [tailoredResume, setTailoredResume] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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

  useEffect(() => {
    if (selectedJobId) {
      const job = savedJobs.find(j => j.id === selectedJobId);
      if (job) {
        setTargetRole(job.title);
        setTargetCompany(job.company);
        setCustomJobDesc(job.description);
      }
    }
  }, [selectedJobId, savedJobs]);

  const handleSaveProfile = () => {
    localStorage.setItem('jobspy_user_profile', JSON.stringify(profile));
    alert('Profile saved successfully!');
  };

  const handleGenerateResume = async () => {
    if (!targetRole && !customJobDesc) {
      alert('Please select a job or enter a target role & job description.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/ai/resume-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          targetRole,
          targetCompany,
          jobDescription: customJobDesc
        })
      });
      const data = await res.json();
      if (data.resume) {
        setTailoredResume(data.resume);
      } else {
        alert(data.error || 'Failed to generate tailored resume');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to AI service');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(tailoredResume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            AI Resume Writer & Tailorer
          </h2>
          <p className="text-sm text-slate-500">
            Generate customized, high-impact resumes tailored specifically for target job descriptions using Gemini.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile & Target Settings */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900">Your Base Profile</h3>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profile.fullName}
                onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                placeholder="Alex Morgan"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={e => setProfile({ ...profile, email: e.target.value })}
                  placeholder="alex@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+1 (555) 019-2834"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Experience Summary & Core Stack
              </label>
              <textarea
                rows={4}
                value={profile.experienceSummary}
                onChange={e => setProfile({ ...profile, experienceSummary: e.target.value })}
                placeholder="Senior Full Stack Engineer with 6+ years building scalable React & Node systems..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>

            <button
              onClick={handleSaveProfile}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
            >
              Save Profile Data
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900">Target Job Selection</h3>
            </div>

            {savedJobs.length > 0 && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Pick from Saved Jobs
                </label>
                <select
                  value={selectedJobId}
                  onChange={e => setSelectedJobId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                >
                  <option value="">-- Custom Input --</option>
                  {savedJobs.map(job => (
                    <option key={job.id} value={job.id}>
                      {job.title} at {job.company}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Target Role Title
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                placeholder="Senior React Engineer"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={targetCompany}
                onChange={e => setTargetCompany(e.target.value)}
                placeholder="TechCorp Inc."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Job Description
              </label>
              <textarea
                rows={5}
                value={customJobDesc}
                onChange={e => setCustomJobDesc(e.target.value)}
                placeholder="Paste job description requirements here..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>

            <button
              onClick={handleGenerateResume}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Tailoring Resume with AI...' : 'Generate Tailored Resume'}</span>
            </button>
          </div>
        </div>

        {/* Generated Output Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs h-full flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900">Tailored Resume Output</h3>
              </div>
              {tailoredResume && (
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy Resume'}</span>
                </button>
              )}
            </div>

            <div className="flex-1 bg-slate-50/70 border border-slate-200 rounded-2xl p-6 overflow-y-auto max-h-[750px]">
              {tailoredResume ? (
                <div className="prose prose-slate max-w-none whitespace-pre-line text-sm leading-relaxed font-sans">
                  {tailoredResume}
                </div>
              ) : (
                <div className="h-96 flex flex-col items-center justify-center text-center text-slate-400 space-y-3">
                  <Award className="w-12 h-12 stroke-1 text-slate-300" />
                  <div>
                    <p className="font-semibold text-slate-600">No tailored resume generated yet</p>
                    <p className="text-xs text-slate-400 mt-1">Configure your profile, select or paste a job description, and click generate.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
