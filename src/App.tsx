import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SearchFilters } from './components/SearchFilters';
import { JobList } from './components/JobList';
import { JobDetailModal } from './components/JobDetailModal';
import { QuickApplyModal } from './components/QuickApplyModal';
import { AnalyticsView } from './components/AnalyticsView';
import { PipelineKanbanView } from './components/PipelineKanbanView';
import { ResumeWriterView } from './components/ResumeWriterView';
import { TerminalLogs } from './components/TerminalLogs';
import { JobPost, SearchParams } from './types';
import { Bookmark, FileText } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'analytics' | 'saved' | 'pipeline' | 'resume' | 'logs'>('search');
  const [params, setParams] = useState<SearchParams>({
    site_name: ['indeed', 'linkedin', 'zip_recruiter'],
    search_term: 'Software Engineer',
    location: 'San Francisco, CA',
    results_wanted: 20,
    is_remote: false,
    job_type: 'all',
  });
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [savedJobs, setSavedJobs] = useState<JobPost[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [jobStages, setJobStages] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('jobspy_job_stages');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [logs, setLogs] = useState<string[]>([
    '[JobSpy] Python JobSpy library initialized successfully.',
    '[JobSpy] Ready to scrape concurrent job boards.'
  ]);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const [quickApplyJob, setQuickApplyJob] = useState<JobPost | null>(null);

  // Initial load
  useEffect(() => {
    handleSearch();
  }, []);

  useEffect(() => {
    localStorage.setItem('jobspy_job_stages', JSON.stringify(jobStages));
  }, [jobStages]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs);
        setLogs(prev => [...data.logs, ...prev]);
      }
    } catch (err) {
      console.error('Failed to scrape jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = (job: JobPost) => {
    if (savedJobs.some(j => j.id === job.id)) {
      setSavedJobs(savedJobs.filter(j => j.id !== job.id));
    } else {
      setSavedJobs([...savedJobs, job]);
      // Set initial stage to saved if not present
      if (!jobStages[job.id]) {
        setJobStages(prev => ({ ...prev, [job.id]: 'saved' }));
      }
    }
  };

  const handleApplied = (jobId: string) => {
    if (!appliedJobIds.includes(jobId)) {
      setAppliedJobIds([...appliedJobIds, jobId]);
    }
    // Also move stage to applied
    setJobStages(prev => ({ ...prev, [jobId]: 'applied' }));
  };

  const handleUpdateStage = (jobId: string, newStage: string) => {
    setJobStages(prev => ({ ...prev, [jobId]: newStage }));
  };

  const handleExportCsv = async () => {
    try {
      const res = await fetch('/api/export/csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobs }),
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jobspy_jobs_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Failed to export CSV:', err);
    }
  };

  const handleExportPdf = async () => {
    try {
      const res = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobs: savedJobs }),
      });
      const htmlText = await res.text();
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(htmlText);
        win.document.close();
      }
    } catch (err) {
      console.error('Failed to export PDF:', err);
    }
  };

  const handleBatchQuickApply = (selectedJobs: JobPost[]) => {
    const updatedApplied = [...appliedJobIds];
    const updatedStages = { ...jobStages };
    const updatedSaved = [...savedJobs];

    selectedJobs.forEach(job => {
      if (!updatedApplied.includes(job.id)) {
        updatedApplied.push(job.id);
      }
      updatedStages[job.id] = 'applied';
      if (!updatedSaved.some(s => s.id === job.id)) {
        updatedSaved.push(job);
      }
    });

    setAppliedJobIds(updatedApplied);
    setJobStages(updatedStages);
    setSavedJobs(updatedSaved);
  };

  const handleBatchSave = (selectedJobs: JobPost[]) => {
    const updatedSaved = [...savedJobs];
    const updatedStages = { ...jobStages };

    selectedJobs.forEach(job => {
      if (!updatedSaved.some(s => s.id === job.id)) {
        updatedSaved.push(job);
      }
      if (!updatedStages[job.id]) {
        updatedStages[job.id] = 'saved';
      }
    });

    setSavedJobs(updatedSaved);
    setJobStages(updatedStages);
  };

  const savedJobIds = savedJobs.map(j => j.id);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedJobs.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'search' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <SearchFilters
              params={params}
              setParams={setParams}
              onSearch={handleSearch}
              loading={loading}
            />
            <JobList
              jobs={jobs}
              onSelectJob={setSelectedJob}
              savedJobIds={savedJobIds}
              onToggleSave={handleToggleSave}
              onExportCsv={handleExportCsv}
              loading={loading}
              onQuickApply={setQuickApplyJob}
              appliedJobIds={appliedJobIds}
              onBatchQuickApply={handleBatchQuickApply}
              onBatchSave={handleBatchSave}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="animate-in fade-in duration-200">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Analytics & Insights</h2>
              <p className="text-sm text-slate-500">Aggregated salary benchmarks and posting distribution across boards</p>
            </div>
            <AnalyticsView jobs={jobs} />
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="animate-in fade-in duration-200">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Saved Job Postings</h2>
                <p className="text-sm text-slate-500">{savedJobs.length} bookmarked opportunities</p>
              </div>
              {savedJobs.length > 0 && (
                <button
                  onClick={handleExportPdf}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-xs transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Export as PDF</span>
                </button>
              )}
            </div>
            {savedJobs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800 mb-1">No Saved Jobs Yet</h3>
                <p className="text-sm text-slate-500">Click the bookmark icon on any job card to save it for later.</p>
              </div>
            ) : (
              <JobList
                jobs={savedJobs}
                onSelectJob={setSelectedJob}
                savedJobIds={savedJobIds}
                onToggleSave={handleToggleSave}
                onExportCsv={handleExportCsv}
                loading={false}
                onQuickApply={setQuickApplyJob}
                appliedJobIds={appliedJobIds}
                onBatchQuickApply={handleBatchQuickApply}
                onBatchSave={handleBatchSave}
              />
            )}
          </div>
        )}

        {activeTab === 'pipeline' && (
          <div className="animate-in fade-in duration-200">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Application Pipeline Kanban</h2>
              <p className="text-sm text-slate-500">Track and manage your saved job applications across stages</p>
            </div>
            <PipelineKanbanView
              savedJobs={savedJobs}
              jobStages={jobStages}
              onUpdateStage={handleUpdateStage}
              onSelectJob={setSelectedJob}
              onToggleSave={handleToggleSave}
            />
          </div>
        )}

        {activeTab === 'resume' && (
          <div className="animate-in fade-in duration-200">
            <ResumeWriterView savedJobs={savedJobs} />
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="animate-in fade-in duration-200">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">JobSpy Terminal Logs</h2>
              <p className="text-sm text-slate-500">Real-time execution logs from Python JobSpy scrapers</p>
            </div>
            <TerminalLogs logs={logs} />
          </div>
        )}
      </main>

      <JobDetailModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        isSaved={selectedJob ? savedJobIds.includes(selectedJob.id) : false}
        onToggleSave={handleToggleSave}
      />

      <QuickApplyModal
        job={quickApplyJob}
        onClose={() => setQuickApplyJob(null)}
        onApplied={handleApplied}
      />
    </div>
  );
}
