import React from 'react';
import { Search, MapPin, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { SearchParams } from '../types';

interface SearchFiltersProps {
  params: SearchParams;
  setParams: React.Dispatch<React.SetStateAction<SearchParams>>;
  onSearch: () => void;
  loading: boolean;
}

const AVAILABLE_SITES = [
  { id: 'indeed', label: 'Indeed' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'zip_recruiter', label: 'ZipRecruiter' },
  { id: 'glassdoor', label: 'Glassdoor' },
  { id: 'google', label: 'Google Jobs' },
];

export const SearchFilters: React.FC<SearchFiltersProps> = ({ params, setParams, onSearch, loading }) => {
  const handleSiteToggle = (siteId: string) => {
    const current = params.site_name;
    if (current.includes(siteId)) {
      if (current.length === 1) return; // keep at least one
      setParams({ ...params, site_name: current.filter(s => s !== siteId) });
    } else {
      setParams({ ...params, site_name: [...current, siteId] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Search Term / Role
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={params.search_term}
                onChange={e => setParams({ ...params, search_term: e.target.value })}
                placeholder="e.g. Software Engineer, Data Scientist, Product Manager"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50/50"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={params.location}
                onChange={e => setParams({ ...params, location: e.target.value })}
                placeholder="e.g. San Francisco, CA or Remote"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50/50"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Job Type
            </label>
            <select
              value={params.job_type}
              onChange={e => setParams({ ...params, job_type: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50/50"
            >
              <option value="all">All Job Types</option>
              <option value="fulltime">Full-time</option>
              <option value="parttime">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Results Wanted Per Site
            </label>
            <input
              type="number"
              min={5}
              max={50}
              value={params.results_wanted}
              onChange={e => setParams({ ...params, results_wanted: parseInt(e.target.value) || 20 })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50/50"
            />
          </div>

          <div className="flex items-center pt-6">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={params.is_remote}
                onChange={e => setParams({ ...params, is_remote: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">Remote Only</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Target Job Boards (JobSpy Concurrent Scrapers)
          </label>
          <div className="flex flex-wrap gap-3">
            {AVAILABLE_SITES.map(site => {
              const active = params.site_name.includes(site.id);
              return (
                <label key={site.id} className="flex items-center space-x-2 cursor-pointer bg-slate-50 hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => handleSiteToggle(site.id)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span>{site.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center space-x-2 w-full max-w-md">
            <input
              type="email"
              id="alert-email-input"
              placeholder="Enter your email for alerts..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50/50"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const emailVal = (e.target as HTMLInputElement).value;
                  if (emailVal) {
                    fetch('/api/alerts/subscribe', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: emailVal, searchParams: params })
                    })
                    .then(r => r.json())
                    .then(data => {
                      alert(data.message || 'Subscribed successfully!');
                      (e.target as HTMLInputElement).value = '';
                    })
                    .catch(() => alert('Failed to subscribe'));
                  }
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById('alert-email-input') as HTMLInputElement;
                if (input && input.value) {
                  fetch('/api/alerts/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: input.value, searchParams: params })
                  })
                  .then(r => r.json())
                  .then(data => {
                    alert(data.message || 'Subscribed successfully!');
                    input.value = '';
                  })
                  .catch(() => alert('Failed to subscribe'));
                } else {
                  alert('Please enter a valid email address.');
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold whitespace-nowrap transition-colors"
            >
              Get Alerts
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Scraping Boards...</span>
              </>
            ) : (
              <>
                <SlidersHorizontal className="w-4 h-4" />
                <span>Run JobSpy Scraper</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
