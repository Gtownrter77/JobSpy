import React from 'react';
import { JobPost } from '../types';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

interface AnalyticsViewProps {
  jobs: JobPost[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ jobs }) => {
  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <h3 className="text-lg font-bold text-slate-800 mb-2">No Analytics Data Available</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Run a job search first to populate analytics and salary distribution charts.
        </p>
      </div>
    );
  }

  // Count by site
  const siteCounts: Record<string, number> = {};
  jobs.forEach(j => {
    siteCounts[j.site] = (siteCounts[j.site] || 0) + 1;
  });
  const siteData = Object.keys(siteCounts).map(site => ({
    name: site.toUpperCase(),
    count: siteCounts[site]
  }));

  // Aggregate salary by job role category
  const roleMap: Record<string, { total: number; count: number; max: number; min: number }> = {
    'Frontend': { total: 0, count: 0, max: 0, min: 999999 },
    'Backend': { total: 0, count: 0, max: 0, min: 999999 },
    'Full Stack': { total: 0, count: 0, max: 0, min: 999999 },
    'DevOps / Cloud': { total: 0, count: 0, max: 0, min: 999999 },
    'Data / AI': { total: 0, count: 0, max: 0, min: 999999 },
    'Other Engineering': { total: 0, count: 0, max: 0, min: 999999 },
  };

  jobs.forEach(j => {
    const titleLower = j.title.toLowerCase();
    let category = 'Other Engineering';
    if (titleLower.includes('front') || titleLower.includes('react') || titleLower.includes('vue')) {
      category = 'Frontend';
    } else if (titleLower.includes('back') || titleLower.includes('node') || titleLower.includes('java') || titleLower.includes('python') || titleLower.includes('go')) {
      category = 'Backend';
    } else if (titleLower.includes('full') || titleLower.includes('software engineer') || titleLower.includes('software developer')) {
      category = 'Full Stack';
    } else if (titleLower.includes('devops') || titleLower.includes('sre') || titleLower.includes('cloud') || titleLower.includes('infrastructure')) {
      category = 'DevOps / Cloud';
    } else if (titleLower.includes('data') || titleLower.includes('ai') || titleLower.includes('ml') || titleLower.includes('machine learning')) {
      category = 'Data / AI';
    }

    const sal = j.max_amount || j.min_amount;
    if (sal && sal > 10000) { // filter out hourly or weird anomalies
      roleMap[category].total += sal;
      roleMap[category].count += 1;
      roleMap[category].max = Math.max(roleMap[category].max, sal);
      roleMap[category].min = Math.min(roleMap[category].min, sal);
    }
  });

  const roleSalaryData = Object.keys(roleMap)
    .filter(role => roleMap[role].count > 0)
    .map(role => ({
      role,
      avgSalary: Math.round(roleMap[role].total / roleMap[role].count),
      maxSalary: roleMap[role].max,
      jobCount: roleMap[role].count,
    }));

  // Salary buckets distribution
  const buckets = [
    { name: '< $100k', count: 0 },
    { name: '$100k - $150k', count: 0 },
    { name: '$150k - $200k', count: 0 },
    { name: '$200k+', count: 0 },
  ];

  jobs.forEach(j => {
    const sal = j.max_amount || j.min_amount;
    if (sal) {
      if (sal < 100000) buckets[0].count += 1;
      else if (sal < 150000) buckets[1].count += 1;
      else if (sal < 200000) buckets[2].count += 1;
      else buckets[3].count += 1;
    }
  });

  // Salary over time trend data
  const dateMap: Record<string, { totalSalary: number; count: number; max: number; min: number }> = {};
  jobs.forEach(j => {
    const date = j.date_posted || 'Unknown';
    const sal = j.max_amount || j.min_amount;
    if (sal) {
      if (!dateMap[date]) {
        dateMap[date] = { totalSalary: 0, count: 0, max: sal, min: sal };
      }
      dateMap[date].totalSalary += sal;
      dateMap[date].count += 1;
      dateMap[date].max = Math.max(dateMap[date].max, sal);
      dateMap[date].min = Math.min(dateMap[date].min, sal);
    }
  });

  const trendData = Object.keys(dateMap)
    .sort()
    .map(date => ({
      date,
      avgSalary: Math.round(dateMap[date].totalSalary / dateMap[date].count),
      maxSalary: dateMap[date].max,
      minSalary: dateMap[date].min,
    }));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Postings</p>
          <p className="text-3xl font-extrabold text-slate-900">{jobs.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Remote Opportunities</p>
          <p className="text-3xl font-extrabold text-emerald-600">{jobs.filter(j => j.is_remote).length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Active Job Boards</p>
          <p className="text-3xl font-extrabold text-blue-600">{Object.keys(siteCounts).length}</p>
        </div>
      </div>

      {/* Salary Distribution by Job Role */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900">Salary Distribution by Job Role</h3>
          <p className="text-xs text-slate-500">Average and maximum compensation breakdown aggregated by normalized job role categories</p>
        </div>
        <div className="h-80">
          {roleSalaryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleSalaryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="role" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgSalary" name="Average Salary ($)" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="maxSalary" name="Max Salary ($)" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              No salary role aggregation available.
            </div>
          )}
        </div>
      </div>

      {/* Salary Trend Over Time */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900">Salary Trend Analysis Over Time</h3>
          <p className="text-xs text-slate-500">Average, maximum, and minimum compensation trends for recent postings</p>
        </div>
        <div className="h-80">
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="maxSalary" name="Max Salary ($)" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="avgSalary" name="Avg Salary ($)" stroke="#2563eb" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="minSalary" name="Min Salary ($)" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              No salary timeline data available for current results.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Salary Bucket Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900">Salary Bucket Distribution</h3>
            <p className="text-xs text-slate-500">Number of job postings across compensation ranges</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={buckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Job Count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900">Postings by Job Board</h3>
            <p className="text-xs text-slate-500">Breakdown of listings per integrated job board</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={siteData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Postings" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};


