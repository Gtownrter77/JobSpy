import React from 'react';
import { Building2, MapPin, DollarSign, Calendar, ExternalLink, Bookmark, TrendingUp, Zap, Sparkles } from 'lucide-react';
import { JobPost } from '../types';

interface JobCardProps {
  job: JobPost;
  onSelect: (job: JobPost) => void;
  isSaved: boolean;
  onToggleSave: (job: JobPost) => void;
  avgSalary: number | null;
  onQuickApply: (job: JobPost) => void;
  isApplied: boolean;
  isSelected?: boolean;
  onToggleSelect?: (jobId: string) => void;
}

const SITE_COLORS: Record<string, string> = {
  indeed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  linkedin: 'bg-sky-50 text-sky-700 border-sky-200',
  zip_recruiter: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  glassdoor: 'bg-amber-50 text-amber-700 border-amber-200',
  google: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onSelect,
  isSaved,
  onToggleSave,
  avgSalary,
  onQuickApply,
  isApplied,
  isSelected,
  onToggleSelect,
}) => {
  const formatSalary = () => {
    if (!job.min_amount && !job.max_amount) return 'Salary not specified';
    const curr = job.currency === 'USD' ? '$' : job.currency;
    if (job.min_amount && job.max_amount) {
      return `${curr}${job.min_amount.toLocaleString()} - ${curr}${job.max_amount.toLocaleString()} / ${job.interval || 'yr'}`;
    }
    return `${curr}${job.min_amount?.toLocaleString() || job.max_amount?.toLocaleString()} / ${job.interval || 'yr'}`;
  };

  const jobAvgSalary = job.min_amount || job.max_amount ? ((job.min_amount || 0) + (job.max_amount || job.min_amount || 0)) / 2 : null;
  const isAboveAverage = avgSalary !== null && jobAvgSalary !== null && jobAvgSalary > avgSalary;

  return (
    <div
      className={`rounded-2xl border transition-all p-6 flex flex-col justify-between ${
        isSelected
          ? 'bg-blue-50/20 border-blue-500 ring-2 ring-blue-500/20 shadow-md'
          : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-start gap-2.5">
            {onToggleSelect && (
              <label
                className="mt-1 flex items-center cursor-pointer"
                onClick={e => e.stopPropagation()}
                title="Select job for batch actions"
              >
                <input
                  type="checkbox"
                  checked={!!isSelected}
                  onChange={() => onToggleSelect(job.id)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                />
              </label>
            )}
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${SITE_COLORS[job.site] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                  {job.site.replace('_', ' ')}
                </span>
              {(() => {
                const getMatchScore = (j: JobPost) => {
                  try {
                    const rawProfile = localStorage.getItem('jobspy_user_profile');
                    if (!rawProfile) return null;
                    const profile = JSON.parse(rawProfile);
                    const summary = (profile.experienceSummary || '').toLowerCase();
                    if (!summary) return 82;
                    const words = summary.split(/\W+/).filter((w: string) => w.length > 3);
                    if (words.length === 0) return 82;
                    const jobText = (j.title + ' ' + j.description).toLowerCase();
                    let matches = 0;
                    const uniqueWords = Array.from(new Set(words));
                    uniqueWords.forEach((word: any) => {
                      if (jobText.includes(word)) {
                        matches++;
                      }
                    });
                    return Math.min(98, Math.max(65, Math.round(65 + (matches / Math.min(8, uniqueWords.length)) * 33)));
                  } catch {
                    return 85;
                  }
                };
                const score = getMatchScore(job);
                if (score === null) return null;
                const badgeColor = score >= 85 ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-700 border-slate-200';
                return (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${badgeColor} border`}>
                    <Sparkles className="w-3 h-3 text-indigo-600" />
                    {score}% Match
                  </span>
                );
              })()}
              {job.is_remote && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Remote
                </span>
              )}
              {isAboveAverage && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                  <TrendingUp className="w-3 h-3 text-amber-600" />
                  Above Market Avg
                </span>
              )}
              {isApplied && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Applied
                </span>
              )}
            </div>
            <h3 
              onClick={() => onSelect(job)}
              className="text-lg font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
            >
              {job.title}
            </h3>
          </div>
        </div>
          <button
            onClick={() => onToggleSave(job)}
            className={`p-2 rounded-xl border transition-colors ${
              isSaved 
                ? 'bg-blue-50 text-blue-600 border-blue-200' 
                : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600'
            }`}
            title={isSaved ? 'Saved' : 'Save Job'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="space-y-2 mb-4 text-sm text-slate-600">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-800">{job.company}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{job.city}, {job.state}</span>
            {job.is_remote && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Remote
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 text-slate-700 font-medium">
            <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{formatSalary()}</span>
          </div>
        </div>

        <p className="text-xs text-slate-500 line-clamp-2 mb-4">
          {job.description}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
        <span className="text-slate-400 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {job.date_posted}
        </span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onQuickApply(job)}
            className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold flex items-center gap-1 transition-colors"
            title="Quick Apply with stored profile"
          >
            <Zap className="w-3 h-3 fill-current text-amber-600" />
            <span>Quick Apply</span>
          </button>
          <a
            href={job.job_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1 shadow-xs transition-colors"
          >
            <span>Apply</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};


