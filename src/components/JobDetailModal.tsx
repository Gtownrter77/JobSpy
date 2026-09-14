import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  Bookmark,
  Sparkles,
  Copy,
  Check,
  Edit3,
  Download,
  Car,
  Bus,
  Bike,
  Navigation,
  Map
} from 'lucide-react';
import { JobPost } from '../types';

interface JobDetailModalProps {
  job: JobPost | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (job: JobPost) => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({ job, onClose, isSaved, onToggleSave }) => {
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [copied, setCopied] = useState(false);
  const [quickNote, setQuickNote] = useState<string>('');
  const [noteSaved, setNoteSaved] = useState(false);

  // Commute distance calculator states
  const [homeAddress, setHomeAddress] = useState<string>(() => localStorage.getItem('jobspy_home_address') || '');
  const [travelMode, setTravelMode] = useState<'DRIVE' | 'TRANSIT' | 'BICYCLE' | 'WALK'>('DRIVE');
  const [calculatingCommute, setCalculatingCommute] = useState(false);
  const [commuteResult, setCommuteResult] = useState<{
    durationText: string;
    distanceMiles: string;
    gmapsUrl: string;
    source: string;
  } | null>(null);

  useEffect(() => {
    if (job) {
      const savedNotes = localStorage.getItem(`jobspy_note_${job.id}`);
      setQuickNote(savedNotes || '');
      setCoverLetter('');
      setCommuteResult(null);
    }
  }, [job]);

  const handleCalculateCommute = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!job || !homeAddress.trim()) return;
    localStorage.setItem('jobspy_home_address', homeAddress.trim());
    setCalculatingCommute(true);
    try {
      const destination = `${job.city}, ${job.state}`;
      const res = await fetch('/api/commute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin: homeAddress.trim(), destination, travelMode })
      });
      const data = await res.json();
      if (data.success) {
        setCommuteResult(data);
      }
    } catch (err) {
      console.error('Failed to calculate commute', err);
    } finally {
      setCalculatingCommute(false);
    }
  };

  const handleSaveNote = () => {
    if (!job) return;
    localStorage.setItem(`jobspy_note_${job.id}`, quickNote);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const handleExportIcs = () => {
    if (!job) return;
    const title = `Interview / Deadline: ${job.title} at ${job.company}`;
    const description = `Job Description: ${(job.description || '').substring(0, 300)}...\n\nOriginal URL: ${job.job_url || ''}`;
    const location = `${job.city}, ${job.state} ${job.is_remote ? '(Remote)' : ''}`;

    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + 3);
    const dateStr = eventDate.toISOString().replace(/-|:|\.\d+/g, '');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `SUMMARY:${title}`,
      `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
      `LOCATION:${location}`,
      `DTSTART:${dateStr}`,
      `DTEND:${dateStr}`,
      `END:VEVENT`,
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${job.company.replace(/[^a-z0-9]/gi, '_')}_interview.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!job) return null;

  const formatSalary = () => {
    if (!job.min_amount && !job.max_amount) return 'Salary not specified';
    const curr = job.currency === 'USD' ? '$' : job.currency;
    if (job.min_amount && job.max_amount) {
      return `${curr}${job.min_amount.toLocaleString()} - ${curr}${job.max_amount.toLocaleString()} / ${job.interval || 'yr'}`;
    }
    return `${curr}${job.min_amount?.toLocaleString() || job.max_amount?.toLocaleString()} / ${job.interval || 'yr'}`;
  };

  const handleGenerateCoverLetter = async () => {
    setLoadingAi(true);
    try {
      let profile = null;
      const savedProfile = localStorage.getItem('jobspy_user_profile');
      if (savedProfile) {
        profile = JSON.parse(savedProfile);
      }

      const res = await fetch('/api/ai/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job, profile })
      });
      const data = await res.json();
      if (data.coverLetter) {
        setCoverLetter(data.coverLetter);
      } else {
        alert(data.error || 'Failed to generate cover letter');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to AI service');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-100 p-6 flex items-center justify-between z-10">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 mb-1">
              {job.site.toUpperCase()}
            </span>
            <h2 className="text-xl font-bold text-slate-900">{job.title}</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onToggleSave(job)}
              className={`p-2.5 rounded-xl border transition-colors ${
                isSaved ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-white shadow-xs text-blue-600">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Company</p>
                <p className="text-sm font-bold text-slate-800">{job.company}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-white shadow-xs text-blue-600">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Location</p>
                <p className="text-sm font-bold text-slate-800">{job.city}, {job.state} {job.is_remote && '(Remote)'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-white shadow-xs text-emerald-600">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Compensation</p>
                <p className="text-sm font-bold text-slate-800">{formatSalary()}</p>
              </div>
            </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-white shadow-xs text-purple-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Posted Date</p>
                <p className="text-sm font-bold text-slate-800">{job.date_posted}</p>
              </div>
            </div>
            <button
              onClick={handleExportIcs}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold border border-purple-200 transition-colors shadow-xs"
              title="Export deadline / interview to calendar (.ics)"
            >
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>Export .ics Calendar</span>
            </button>
          </div>
        </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Job Description</h3>
            <div className="text-sm text-slate-700 leading-relaxed space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
              <p>{job.description}</p>
            </div>
          </div>

          {/* Commute Distance & Travel Time Calculator */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Navigation className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Commute Distance & Travel Time
                </h3>
              </div>
              {job.is_remote ? (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Remote Position
                </span>
              ) : (
                <span className="text-xs text-slate-500">
                  Destination: {job.city}, {job.state}
                </span>
              )}
            </div>

            <form onSubmit={handleCalculateCommute} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={homeAddress}
                    onChange={e => setHomeAddress(e.target.value)}
                    placeholder="Enter your home address or zip code..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={calculatingCommute || !homeAddress.trim()}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{calculatingCommute ? 'Calculating...' : 'Calculate Commute'}</span>
                </button>
              </div>

              {/* Mode Selectors */}
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="text-[11px] font-semibold text-slate-500 mr-1">Travel Mode:</span>
                {[
                  { id: 'DRIVE', label: 'Drive', icon: Car },
                  { id: 'TRANSIT', label: 'Transit', icon: Bus },
                  { id: 'BICYCLE', label: 'Bicycle', icon: Bike },
                  { id: 'WALK', label: 'Walk', icon: MapPin },
                ].map(mode => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setTravelMode(mode.id as any)}
                      className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                        travelMode === mode.id
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </form>

            {commuteResult && (
              <div className="bg-white p-4 rounded-xl border border-emerald-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center space-x-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Estimated Duration</span>
                    <h4 className="text-xl font-extrabold text-slate-900">{commuteResult.durationText}</h4>
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Distance</span>
                    <h4 className="text-xl font-extrabold text-slate-900">{commuteResult.distanceMiles}</h4>
                  </div>
                </div>

                <a
                  href={commuteResult.gmapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors shadow-2xs self-start sm:self-auto"
                >
                  <Map className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Google Maps Directions &rarr;</span>
                </a>
              </div>
            )}
          </div>

          {/* Quick Note Section */}
          <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-amber-700" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Quick Note / Interview Prep</h3>
              </div>
              <button
                onClick={handleSaveNote}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                {noteSaved ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{noteSaved ? 'Note Saved' : 'Save Note'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={quickNote}
              onChange={e => setQuickNote(e.target.value)}
              placeholder="Add personal notes, recruiter contact info, interview reminders, or salary negotiation details..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-slate-400"
            />
          </div>

          {/* AI Cover Letter Generator Section */}
          <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-purple-50/80 p-5 rounded-2xl border border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Gemini AI Cover Letter</h3>
              </div>
              <button
                onClick={handleGenerateCoverLetter}
                disabled={loadingAi}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold text-xs shadow-sm transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{loadingAi ? 'Generating...' : coverLetter ? 'Regenerate Cover Letter' : 'Generate Cover Letter'}</span>
              </button>
            </div>

            {coverLetter && (
              <div className="mt-4 bg-white p-4 rounded-xl border border-slate-200 relative group animate-in fade-in duration-300">
                <div className="absolute top-3 right-3">
                  <button
                    onClick={handleCopy}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Tailored for {job.company}</p>
                <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed font-sans pr-12">
                  {coverLetter}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-100 p-6 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
          >
            Close
          </button>
          <a
            href={job.job_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-colors"
          >
            <span>Apply on {job.site.toUpperCase()}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

