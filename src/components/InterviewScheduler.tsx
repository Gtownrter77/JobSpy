import React, { useState, useEffect } from 'react';
import { JobPost, ScheduledInterview } from '../types';
import {
  Calendar,
  Clock,
  Video,
  Phone,
  Building,
  Plus,
  Trash2,
  ExternalLink,
  CalendarCheck,
  Download,
  CheckCircle2,
  ChevronRight,
  Filter,
  Sparkles,
  X
} from 'lucide-react';

interface InterviewSchedulerProps {
  savedJobs: JobPost[];
  jobStages: Record<string, string>;
  onUpdateStage: (jobId: string, newStage: string) => void;
  onSelectJob: (job: JobPost) => void;
  preselectedJobId?: string | null;
  onCloseSchedulerModal?: () => void;
}

const INTERVIEW_TYPES = [
  { id: 'phone_screen', label: 'Phone Recruiter Screen', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'technical', label: 'Technical Assessment / Coding', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: 'hiring_manager', label: 'Hiring Manager Interview', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'system_design', label: 'System Design / Architecture', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { id: 'behavioral', label: 'Behavioral & Leadership', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'final_round', label: 'Final Round / Executive', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'other', label: 'Other Meeting', color: 'bg-slate-100 text-slate-700 border-slate-200' },
];

export const InterviewScheduler: React.FC<InterviewSchedulerProps> = ({
  savedJobs,
  jobStages,
  onUpdateStage,
  onSelectJob,
  preselectedJobId,
  onCloseSchedulerModal,
}) => {
  const [interviews, setInterviews] = useState<ScheduledInterview[]>([]);
  const [showAddForm, setShowAddForm] = useState<boolean>(!!preselectedJobId);
  const [selectedJobId, setSelectedJobId] = useState<string>(preselectedJobId || (savedJobs[0]?.id || ''));
  const [date, setDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState<string>('14:00');
  const [type, setType] = useState<ScheduledInterview['type']>('technical');
  const [locationType, setLocationType] = useState<'video' | 'phone' | 'onsite'>('video');
  const [meetingUrlOrLocation, setMeetingUrlOrLocation] = useState<string>('');
  const [interviewer, setInterviewer] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [autoAdvanceStage, setAutoAdvanceStage] = useState<boolean>(true);
  const [filterStage, setFilterStage] = useState<string>('all');

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('jobspy_scheduled_interviews');
      if (stored) {
        setInterviews(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load interviews', e);
    }
  }, []);

  useEffect(() => {
    if (preselectedJobId) {
      setSelectedJobId(preselectedJobId);
      setShowAddForm(true);
    }
  }, [preselectedJobId]);

  const saveInterviewsToStorage = (updated: ScheduledInterview[]) => {
    setInterviews(updated);
    localStorage.setItem('jobspy_scheduled_interviews', JSON.stringify(updated));
  };

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const targetJob = savedJobs.find(j => j.id === selectedJobId);
    if (!targetJob) return;

    const newInterview: ScheduledInterview = {
      id: `interview_${Date.now()}`,
      jobId: targetJob.id,
      jobTitle: targetJob.title,
      company: targetJob.company,
      date,
      time,
      type,
      locationType,
      meetingUrlOrLocation,
      interviewer,
      notes,
      createdAt: Date.now(),
    };

    const updated = [newInterview, ...interviews];
    saveInterviewsToStorage(updated);

    // Auto move job to 'interviewing' stage if requested
    if (autoAdvanceStage && jobStages[targetJob.id] !== 'interviewing' && jobStages[targetJob.id] !== 'offer') {
      onUpdateStage(targetJob.id, 'interviewing');
    }

    // Reset form
    setMeetingUrlOrLocation('');
    setInterviewer('');
    setNotes('');
    setShowAddForm(false);
    if (onCloseSchedulerModal) {
      onCloseSchedulerModal();
    }
  };

  const handleDelete = (id: string) => {
    const updated = interviews.filter(i => i.id !== id);
    saveInterviewsToStorage(updated);
  };

  const generateIcsFile = (interview: ScheduledInterview) => {
    const title = `${interview.type.replace('_', ' ').toUpperCase()} Interview: ${interview.jobTitle} at ${interview.company}`;
    const description = `Interview Type: ${interview.type.replace('_', ' ')}\\nInterviewer: ${interview.interviewer || 'N/A'}\\nNotes: ${interview.notes || 'None'}\\nLocation / Meeting: ${interview.meetingUrlOrLocation || 'TBD'}`;
    const location = interview.meetingUrlOrLocation || 'Online';

    // Parse date & time to ISO format without hyphens
    const [year, month, day] = interview.date.split('-');
    const [hour, min] = (interview.time || '10:00').split(':');
    const startStr = `${year}${month}${day}T${hour}${min}00`;
    
    // Add 1 hour for end time
    const endHour = String((Number(hour) + 1) % 24).padStart(2, '0');
    const endStr = `${year}${month}${day}T${endHour}${min}00`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//JobSpy Career Suite//Interview Scheduler//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Interview_${interview.company.replace(/[^a-z0-9]/gi, '_')}_${interview.date}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openGoogleCalendar = (interview: ScheduledInterview) => {
    const title = encodeURIComponent(`${interview.type.replace('_', ' ').toUpperCase()}: ${interview.jobTitle} at ${interview.company}`);
    const details = encodeURIComponent(
      `Job: ${interview.jobTitle} (${interview.company})\nInterviewer: ${interview.interviewer || 'N/A'}\nType: ${interview.type.replace('_', ' ')}\nNotes: ${interview.notes || 'N/A'}\nLink: ${interview.meetingUrlOrLocation || 'TBD'}`
    );
    const location = encodeURIComponent(interview.meetingUrlOrLocation || '');
    
    const [year, month, day] = interview.date.split('-');
    const [hour, min] = (interview.time || '10:00').split(':');
    const startStr = `${year}${month}${day}T${hour}${min}00`;
    const endHour = String((Number(hour) + 1) % 24).padStart(2, '0');
    const endStr = `${year}${month}${day}T${endHour}${min}00`;

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Sort interviews chronologically
  const sortedInterviews = [...interviews].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
    const dateB = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
    return dateA - dateB;
  });

  // Filter based on stage of linked job
  const filteredInterviews = sortedInterviews.filter(i => {
    if (filterStage === 'all') return true;
    const stage = jobStages[i.jobId] || 'saved';
    return stage === filterStage;
  });

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const upcomingInterviews = filteredInterviews.filter(i => `${i.date}T${i.time}` >= `${todayStr}T00:00`);
  const pastInterviews = filteredInterviews.filter(i => `${i.date}T${i.time}` < `${todayStr}T00:00`);

  const formatCountdown = (dateStr: string) => {
    const target = new Date(`${dateStr}T00:00:00`);
    const today = new Date(`${todayStr}T00:00:00`);
    const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { label: 'Today', urgent: true };
    if (diffDays === 1) return { label: 'Tomorrow', urgent: true };
    if (diffDays > 1 && diffDays <= 7) return { label: `In ${diffDays} days`, urgent: false };
    if (diffDays > 7) return { label: `In ${diffDays} days`, urgent: false };
    return { label: `${Math.abs(diffDays)} days ago`, urgent: false };
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Pipeline Interview Scheduler & Timeline</h3>
              <p className="text-xs text-slate-500">
                Link calendar events to jobs in your pipeline, track interview milestones, and sync to Google Calendar or iCal.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterStage}
              onChange={e => setFilterStage(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-700"
            >
              <option value="all">All Linked Stages</option>
              <option value="applied">Applied Jobs</option>
              <option value="interviewing">Interviewing Stage</option>
              <option value="offer">Offer Stage</option>
            </select>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Close Form' : 'Schedule Interview'}</span>
          </button>
        </div>
      </div>

      {/* Schedule Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl border border-purple-200 p-6 shadow-md transition-all">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h4 className="text-sm font-bold text-slate-900">Schedule a New Interview</h4>
            </div>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSchedule} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Select Pipeline Job *
                </label>
                <select
                  required
                  value={selectedJobId}
                  onChange={e => setSelectedJobId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
                >
                  {savedJobs.map(j => {
                    const currentStage = jobStages[j.id] || 'saved';
                    return (
                      <option key={j.id} value={j.id}>
                        [{currentStage.toUpperCase()}] {j.title} @ {j.company}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Interview Type *
                </label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
                >
                  {INTERVIEW_TYPES.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Meeting Mode & Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setLocationType('video')}
                    className={`flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                      locationType === 'video'
                        ? 'bg-purple-50 border-purple-500 text-purple-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Video</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationType('phone')}
                    className={`flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                      locationType === 'phone'
                        ? 'bg-purple-50 border-purple-500 text-purple-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Phone</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationType('onsite')}
                    className={`flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                      locationType === 'onsite'
                        ? 'bg-purple-50 border-purple-500 text-purple-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5" />
                    <span>Onsite</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Meeting URL / Location Address
                </label>
                <input
                  type="text"
                  placeholder={locationType === 'video' ? 'https://meet.google.com/... or Zoom Link' : 'Office address or phone number'}
                  value={meetingUrlOrLocation}
                  onChange={e => setMeetingUrlOrLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Interviewer(s) / Panel Members
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins (Engineering Lead)"
                  value={interviewer}
                  onChange={e => setInterviewer(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Preparation Notes / Agenda
              </label>
              <textarea
                rows={2}
                placeholder="Review system architecture patterns, prepare questions about the team stack..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoAdvanceStage}
                  onChange={e => setAutoAdvanceStage(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                />
                <span>Automatically move job to <strong>Interviewing</strong> stage in Pipeline</span>
              </label>

              <div className="flex items-center space-x-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Confirm & Add to Schedule</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Timeline Display */}
      {interviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-900">No Interviews Scheduled Yet</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Link calendar appointments, technical screens, and interviews to jobs in your pipeline to view them on this timeline and export .ics files.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule First Interview</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Upcoming Interviews Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Upcoming Timeline ({upcomingInterviews.length})
                </h4>
              </div>
              <span className="text-xs text-slate-400">Sorted chronologically</span>
            </div>

            {upcomingInterviews.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">No upcoming interviews matching filters.</p>
            ) : (
              <div className="relative border-l-2 border-purple-200 ml-4 pl-6 space-y-8">
                {upcomingInterviews.map(interview => {
                  const job = savedJobs.find(j => j.id === interview.jobId);
                  const typeObj = INTERVIEW_TYPES.find(t => t.id === interview.type) || INTERVIEW_TYPES[0];
                  const countdown = formatCountdown(interview.date);
                  const jobStage = job ? (jobStages[job.id] || 'saved') : 'saved';

                  return (
                    <div key={interview.id} className="relative group">
                      {/* Timeline dot */}
                      <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-purple-600 ring-4 ring-purple-100" />

                      <div className="bg-slate-50 hover:bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5 shadow-xs transition-all space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${typeObj.color}`}>
                              {typeObj.label}
                            </span>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700 uppercase">
                              Stage: {jobStage}
                            </span>
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                countdown.urgent ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {countdown.label}
                            </span>
                          </div>

                          {/* Quick Calendar Actions */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openGoogleCalendar(interview)}
                              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
                              title="Add to Google Calendar"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                              <span>Google Cal</span>
                            </button>
                            <button
                              onClick={() => generateIcsFile(interview)}
                              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
                              title="Download iCal (.ics) Event"
                            >
                              <Download className="w-3.5 h-3.5 text-purple-600" />
                              <span>Export .ics</span>
                            </button>
                            <button
                              onClick={() => handleDelete(interview.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors"
                              title="Delete interview"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <h4
                            onClick={() => job && onSelectJob(job)}
                            className="text-base font-bold text-slate-900 hover:text-purple-600 cursor-pointer transition-colors"
                          >
                            {interview.jobTitle}
                          </h4>
                          <p className="text-xs font-semibold text-slate-600">{interview.company}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 pt-1">
                          <div className="flex items-center space-x-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{new Date(`${interview.date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{interview.time}</span>
                          </div>
                          <div className="flex items-center space-x-1.5 truncate">
                            {interview.locationType === 'video' && <Video className="w-3.5 h-3.5 text-purple-500 shrink-0" />}
                            {interview.locationType === 'phone' && <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                            {interview.locationType === 'onsite' && <Building className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                            <span className="truncate">
                              {interview.meetingUrlOrLocation ? (
                                interview.meetingUrlOrLocation.startsWith('http') ? (
                                  <a href={interview.meetingUrlOrLocation} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline">
                                    Join Meeting &rarr;
                                  </a>
                                ) : (
                                  interview.meetingUrlOrLocation
                                )
                              ) : (
                                'Location to be confirmed'
                              )}
                            </span>
                          </div>
                        </div>

                        {interview.interviewer && (
                          <div className="text-xs text-slate-600 bg-white/70 px-3 py-1.5 rounded-lg border border-slate-200/60">
                            <strong>Interviewer:</strong> {interview.interviewer}
                          </div>
                        )}

                        {interview.notes && (
                          <div className="text-xs text-slate-500 bg-white/70 px-3 py-2 rounded-lg border border-slate-200/60 whitespace-pre-wrap">
                            <strong>Prep / Notes:</strong> {interview.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Past Interviews Section */}
          {pastInterviews.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs opacity-85">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Past Interviews ({pastInterviews.length})
                </h4>
              </div>

              <div className="space-y-3">
                {pastInterviews.map(interview => {
                  const typeObj = INTERVIEW_TYPES.find(t => t.id === interview.type) || INTERVIEW_TYPES[0];
                  return (
                    <div
                      key={interview.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-800">{interview.jobTitle}</span>
                          <span className="text-slate-500">at {interview.company}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${typeObj.color}`}>
                            {typeObj.label}
                          </span>
                        </div>
                        <div className="text-slate-400">
                          {interview.date} at {interview.time} {interview.interviewer ? `• With ${interview.interviewer}` : ''}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => generateIcsFile(interview)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
                          title="Download .ics"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(interview.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-200"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
