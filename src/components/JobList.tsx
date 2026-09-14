import React, { useState } from 'react';
import { JobPost } from '../types';
import { JobCard } from './JobCard';
import { Download, LayoutGrid, List, DollarSign, TrendingUp, Briefcase, CheckSquare, Square, Zap, Bookmark, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface JobListProps {
  jobs: JobPost[];
  onSelectJob: (job: JobPost) => void;
  savedJobIds: string[];
  onToggleSave: (job: JobPost) => void;
  onExportCsv: () => void;
  loading: boolean;
  onQuickApply: (job: JobPost) => void;
  appliedJobIds: string[];
  onBatchQuickApply?: (jobs: JobPost[]) => void;
  onBatchSave?: (jobs: JobPost[]) => void;
}

export const JobList: React.FC<JobListProps> = ({
  jobs,
  onSelectJob,
  savedJobIds,
  onToggleSave,
  onExportCsv,
  loading,
  onQuickApply,
  appliedJobIds,
  onBatchQuickApply,
  onBatchSave,
}) => {
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const [batchFeedback, setBatchFeedback] = useState<string | null>(null);

  const toggleSelectJob = (jobId: string) => {
    setSelectedJobIds(prev =>
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  };

  const handleSelectAll = () => {
    if (selectedJobIds.length === jobs.length) {
      setSelectedJobIds([]);
    } else {
      setSelectedJobIds(jobs.map(j => j.id));
    }
  };

  const handleBatchQuickApplyAction = () => {
    const targetJobs = jobs.filter(j => selectedJobIds.includes(j.id));
    if (targetJobs.length === 0) return;

    if (onBatchQuickApply) {
      onBatchQuickApply(targetJobs);
    } else {
      // Fallback
      targetJobs.forEach(job => onQuickApply(job));
    }

    setBatchFeedback(`Batch applied to ${targetJobs.length} job(s) and advanced pipeline stages.`);
    setSelectedJobIds([]);
    setTimeout(() => setBatchFeedback(null), 4000);
  };

  const handleBatchSaveAction = () => {
    const targetJobs = jobs.filter(j => selectedJobIds.includes(j.id));
    if (targetJobs.length === 0) return;

    if (onBatchSave) {
      onBatchSave(targetJobs);
    } else {
      targetJobs.forEach(job => {
        if (!savedJobIds.includes(job.id)) {
          onToggleSave(job);
        }
      });
    }

    setBatchFeedback(`Saved ${targetJobs.length} job(s) to your pipeline.`);
    setSelectedJobIds([]);
    setTimeout(() => setBatchFeedback(null), 4000);
  };
  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h3 className="text-lg font-bold text-slate-800">Scraping Job Boards...</h3>
        <p className="text-sm text-slate-500 mt-1">JobSpy is querying concurrent job boards and aggregating results.</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <h3 className="text-lg font-bold text-slate-800 mb-2">No Job Postings Found</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Try adjusting your search criteria or selecting different job boards above to run the JobSpy scraper.
        </p>
      </div>
    );
  }

  // Calculate salary summary metrics
  const jobsWithSalary = jobs.filter(j => j.min_amount !== null || j.max_amount !== null);
  let minSalary: number | null = null;
  let maxSalary: number | null = null;
  let avgSalary: number | null = null;

  if (jobsWithSalary.length > 0) {
    const allMins = jobsWithSalary.map(j => j.min_amount ?? j.max_amount ?? 0).filter(v => v > 0);
    const allMaxs = jobsWithSalary.map(j => j.max_amount ?? j.min_amount ?? 0).filter(v => v > 0);
    if (allMins.length > 0) minSalary = Math.min(...allMins);
    if (allMaxs.length > 0) maxSalary = Math.max(...allMaxs);

    const averages = jobsWithSalary.map(j => {
      const mn = j.min_amount || j.max_amount || 0;
      const mx = j.max_amount || j.min_amount || 0;
      return (mn + mx) / 2;
    }).filter(v => v > 0);

    if (averages.length > 0) {
      avgSalary = Math.round(averages.reduce((a, b) => a + b, 0) / averages.length);
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Scraped Job Results</h2>
          <p className="text-xs text-slate-500">Showing {jobs.length} aggregated job postings</p>
        </div>
        <button
          onClick={onExportCsv}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export to CSV</span>
        </button>
      </div>

      {/* Summary Widget */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Jobs Found</p>
            <p className="text-sm font-bold text-slate-800">{jobs.length} active listings</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Est. Salary Range</p>
            <p className="text-sm font-bold text-slate-800">
              {minSalary !== null && maxSalary !== null 
                ? `$${minSalary.toLocaleString()} - $${maxSalary.toLocaleString()}`
                : 'N/A'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Average Salary</p>
            <p className="text-sm font-bold text-slate-800">
              {avgSalary !== null ? `$${avgSalary.toLocaleString()} / yr` : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Batch Actions & Multi-Select Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 mb-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSelectAll}
            className="flex items-center space-x-2 text-xs font-bold text-slate-700 hover:text-blue-600 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {selectedJobIds.length === jobs.length ? (
              <CheckSquare className="w-4 h-4 text-blue-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>
              {selectedJobIds.length === jobs.length ? 'Deselect All' : 'Select All'} ({selectedJobIds.length}/{jobs.length} selected)
            </span>
          </button>

          {selectedJobIds.length > 0 && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {selectedJobIds.length} job{selectedJobIds.length > 1 ? 's' : ''} chosen
            </span>
          )}
        </div>

        {selectedJobIds.length > 0 ? (
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleBatchSaveAction}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors shadow-2xs"
            >
              <Bookmark className="w-3.5 h-3.5 text-slate-600" />
              <span>Save ({selectedJobIds.length})</span>
            </button>

            <button
              onClick={handleBatchQuickApplyAction}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Batch Quick Apply ({selectedJobIds.length})</span>
            </button>
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">
            Check boxes on cards to perform batch Quick Apply or save multiple jobs.
          </span>
        )}
      </div>

      {batchFeedback && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{batchFeedback}</span>
        </div>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {jobs.map(job => (
          <motion.div key={job.id} variants={itemVariants}>
            <JobCard
              job={job}
              onSelect={onSelectJob}
              isSaved={savedJobIds.includes(job.id)}
              onToggleSave={onToggleSave}
              avgSalary={avgSalary}
              onQuickApply={onQuickApply}
              isApplied={appliedJobIds.includes(job.id)}
              isSelected={selectedJobIds.includes(job.id)}
              onToggleSelect={toggleSelectJob}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
