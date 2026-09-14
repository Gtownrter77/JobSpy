import React, { useState, useEffect } from 'react';
import { JobPost, ScheduledInterview } from '../types';
import { Building2, MapPin, DollarSign, ExternalLink, ArrowRight, ArrowLeft, Trash2, Filter, Kanban, CalendarCheck, Calendar, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { InterviewScheduler } from './InterviewScheduler';

interface PipelineKanbanViewProps {
  savedJobs: JobPost[];
  jobStages: Record<string, string>;
  onUpdateStage: (jobId: string, newStage: string) => void;
  onSelectJob: (job: JobPost) => void;
  onToggleSave: (job: JobPost) => void;
}

const STAGES = [
  { id: 'saved', label: 'Saved / Wishlist', color: 'border-slate-200 bg-slate-50/50 text-slate-700 header-bg: bg-slate-100' },
  { id: 'applied', label: 'Applied', color: 'border-blue-200 bg-blue-50/30 text-blue-900 header-bg: bg-blue-100' },
  { id: 'interviewing', label: 'Interviewing', color: 'border-amber-200 bg-amber-50/30 text-amber-900 header-bg: bg-amber-100' },
  { id: 'offer', label: 'Offer Received', color: 'border-emerald-200 bg-emerald-50/30 text-emerald-900 header-bg: bg-emerald-100' },
  { id: 'rejected', label: 'Archived / Rejected', color: 'border-rose-200 bg-rose-50/30 text-rose-900 header-bg: bg-rose-100' },
];

export const PipelineKanbanView: React.FC<PipelineKanbanViewProps> = ({
  savedJobs,
  jobStages,
  onUpdateStage,
  onSelectJob,
  onToggleSave,
}) => {
  const [activeSubView, setActiveSubView] = useState<'board' | 'scheduler'>('board');
  const [siteFilter, setSiteFilter] = useState<string>('all');
  const [minSalaryFilter, setMinSalaryFilter] = useState<number>(0);
  const [preselectedJobId, setPreselectedJobId] = useState<string | null>(null);
  const [scheduledInterviews, setScheduledInterviews] = useState<ScheduledInterview[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('jobspy_scheduled_interviews');
      if (stored) {
        setScheduledInterviews(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, [activeSubView]);

  if (savedJobs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <h3 className="text-lg font-bold text-slate-800 mb-1">No Jobs in Pipeline</h3>
        <p className="text-sm text-slate-500">Save jobs from search results to track your application pipeline here.</p>
      </div>
    );
  }

  const handleOpenSchedulerForJob = (jobId: string) => {
    setPreselectedJobId(jobId);
    setActiveSubView('scheduler');
  };

  // Filter savedJobs based on site and salary
  const filteredSavedJobs = savedJobs.filter(job => {
    if (siteFilter !== 'all' && job.site !== siteFilter) return false;
    if (minSalaryFilter > 0) {
      const max = job.max_amount || job.min_amount || 0;
      if (max < minSalaryFilter) return false;
    }
    return true;
  });

  const availableSites = Array.from(new Set(savedJobs.map(j => j.site)));

  const formatSalary = (job: JobPost) => {
    if (!job.min_amount && !job.max_amount) return 'Salary not specified';
    const curr = job.currency === 'USD' ? '$' : job.currency;
    if (job.min_amount && job.max_amount) {
      return `${curr}${job.min_amount.toLocaleString()} - ${curr}${job.max_amount.toLocaleString()} / ${job.interval || 'yr'}`;
    }
    return `${curr}${job.min_amount?.toLocaleString() || job.max_amount?.toLocaleString()} / ${job.interval || 'yr'}`;
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Subview Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveSubView('board')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeSubView === 'board'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Kanban className="w-4 h-4" />
            <span>Kanban Board</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeSubView === 'board' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {savedJobs.length}
            </span>
          </button>

          <button
            onClick={() => {
              setPreselectedJobId(null);
              setActiveSubView('scheduler');
            }}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeSubView === 'scheduler'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Interview Scheduler & Timeline</span>
            {scheduledInterviews.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeSubView === 'scheduler' ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-800'}`}>
                {scheduledInterviews.length}
              </span>
            )}
          </button>
        </div>

        {activeSubView === 'board' && (
          <button
            onClick={() => {
              setPreselectedJobId(savedJobs[0]?.id || null);
              setActiveSubView('scheduler');
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 transition-colors shadow-2xs self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Interview</span>
          </button>
        )}
      </div>

      {activeSubView === 'scheduler' ? (
        <InterviewScheduler
          savedJobs={savedJobs}
          jobStages={jobStages}
          onUpdateStage={onUpdateStage}
          onSelectJob={onSelectJob}
          preselectedJobId={preselectedJobId}
        />
      ) : (
        <>
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2 text-slate-700 font-bold text-sm">
              <Filter className="w-4 h-4 text-blue-600" />
              <span>Filter Pipeline ({filteredSavedJobs.length} of {savedJobs.length} jobs)</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div>
                <select
                  value={siteFilter}
                  onChange={e => setSiteFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                >
                  <option value="all">All Job Boards</option>
                  {availableSites.map(site => (
                    <option key={site} value={site}>
                      {site.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={minSalaryFilter}
                  onChange={e => setMinSalaryFilter(Number(e.target.value))}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                >
                  <option value="0">Any Salary</option>
                  <option value="50000">$50,000+ / yr</option>
                  <option value="100000">$100,000+ / yr</option>
                  <option value="150000">$150,000+ / yr</option>
                  <option value="200000">$200,000+ / yr</option>
                </select>
              </div>
              {(siteFilter !== 'all' || minSalaryFilter > 0) && (
                <button
                  onClick={() => {
                    setSiteFilter('all');
                    setMinSalaryFilter(0);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Summary Stats Widget */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {STAGES.map(stage => {
              const count = filteredSavedJobs.filter(job => (jobStages[job.id] || 'saved') === stage.id).length;
              return (
                <div key={`stat-${stage.id}`} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{stage.label}</p>
                    <h4 className="text-2xl font-black text-slate-900 mt-0.5">{count}</h4>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm">
                    {count}
                  </div>
                </div>
              );
            })}
          </div>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 min-w-[1100px]">
          {STAGES.map(stage => {
            const stageJobs = filteredSavedJobs.filter(job => {
              const currentStage = jobStages[job.id] || 'saved';
              return currentStage === stage.id;
            });

            return (
              <div key={stage.id} className={`rounded-2xl border ${stage.color} flex flex-col shadow-xs`}>
                <div className="p-3.5 border-b border-inherit flex items-center justify-between font-bold text-xs uppercase tracking-wider">
                  <span>{stage.label}</span>
                  <span className="w-6 h-6 rounded-full bg-white/80 border border-slate-200 text-slate-700 flex items-center justify-center text-xs">
                    {stageJobs.length}
                  </span>
                </div>

                <div className="p-3 space-y-3 flex-1 min-h-[400px]">
                  <AnimatePresence mode="popLayout">
                    {stageJobs.map(job => {
                      const currentIndex = STAGES.findIndex(s => s.id === stage.id);
                      const prevStage = currentIndex > 0 ? STAGES[currentIndex - 1] : null;
                      const nextStage = currentIndex < STAGES.length - 1 ? STAGES[currentIndex + 1] : null;

                      return (
                        <motion.div
                          key={job.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9, y: 15 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-3 relative group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              {job.site.replace('_', ' ')}
                            </span>
                            <button
                              onClick={() => onToggleSave(job)}
                              className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                              title="Remove from saved"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div>
                            <h4
                              onClick={() => onSelectJob(job)}
                              className="font-bold text-slate-900 text-sm hover:text-blue-600 cursor-pointer line-clamp-1"
                            >
                              {job.title}
                            </h4>
                            <div className="flex items-center text-xs text-slate-600 gap-1.5 mt-1">
                              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{job.company}</span>
                            </div>
                          </div>

                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{job.city}, {job.state} {job.is_remote ? '(Remote)' : ''}</span>
                          </div>

                          <div className="text-xs font-medium text-emerald-700 bg-emerald-50/50 px-2 py-1 rounded-lg border border-emerald-100/60 truncate">
                            {formatSalary(job)}
                          </div>

                          {/* Scheduled Interviews Badge */}
                          {(() => {
                            const jobInterviews = scheduledInterviews.filter(i => i.jobId === job.id);
                            if (jobInterviews.length === 0) return null;
                            return (
                              <button
                                onClick={() => handleOpenSchedulerForJob(job.id)}
                                className="w-full text-left flex items-center justify-between text-[11px] font-bold text-purple-800 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200 transition-colors"
                              >
                                <span className="flex items-center space-x-1.5">
                                  <Calendar className="w-3 h-3 text-purple-600" />
                                  <span>{jobInterviews.length} Scheduled Interview{jobInterviews.length > 1 ? 's' : ''}</span>
                                </span>
                                <span className="text-[10px] text-purple-600 underline">View</span>
                              </button>
                            );
                          })()}

                          {/* Stage transition controls & Schedule action */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs gap-1">
                            {prevStage ? (
                              <button
                                onClick={() => onUpdateStage(job.id, prevStage.id)}
                                className="flex items-center space-x-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
                                title={`Move to ${prevStage.label}`}
                              >
                                <ArrowLeft className="w-3 h-3" />
                                <span>Prev</span>
                              </button>
                            ) : <div />}

                            <button
                              onClick={() => handleOpenSchedulerForJob(job.id)}
                              className="flex items-center space-x-1 px-2 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold transition-colors"
                              title="Schedule interview or calendar event"
                            >
                              <CalendarCheck className="w-3 h-3 text-purple-600" />
                              <span>+ Interview</span>
                            </button>

                            {nextStage && (
                              <button
                                onClick={() => onUpdateStage(job.id, nextStage.id)}
                                className="flex items-center space-x-1 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold transition-colors"
                                title={`Move to ${nextStage.label}`}
                              >
                                <span>Next</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {stageJobs.length === 0 && (
                    <div className="h-32 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200/60 rounded-xl">
                      No jobs in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
        </>
      )}
    </div>
  );
};

