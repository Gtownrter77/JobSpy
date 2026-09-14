import React, { useState, useEffect } from 'react';
import { Search, BarChart3, Bookmark, Terminal, Briefcase, Kanban, FileText, Mail, Settings, X, Check } from 'lucide-react';

interface NavbarProps {
  activeTab: 'search' | 'analytics' | 'saved' | 'pipeline' | 'resume' | 'logs';
  setActiveTab: (tab: 'search' | 'analytics' | 'saved' | 'pipeline' | 'resume' | 'logs') => void;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, savedCount }) => {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('jobspy_digest_email');
    const savedEnabled = localStorage.getItem('jobspy_digest_enabled') === 'true';
    if (savedEmail) setEmailAddress(savedEmail);
    setEmailEnabled(savedEnabled);
  }, []);

  const handleSaveEmailSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailAddress || !emailAddress.includes('@')) {
      setStatusMessage('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/email/daily-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailAddress, enabled: emailEnabled }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('jobspy_digest_email', emailAddress);
        localStorage.setItem('jobspy_digest_enabled', String(emailEnabled));
        setStatusMessage(data.message);
        setTimeout(() => setShowSettingsModal(false), 2500);
      } else {
        setStatusMessage(data.error || 'Failed to update email preferences');
      }
    } catch (err) {
      setStatusMessage('Network error connecting to email service provider.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                JobSpy <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">Aggregator</span>
              </h1>
              <p className="text-xs text-slate-500">Multi-Board Job Scraping & Analytics Dashboard</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <nav className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => setActiveTab('search')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'search'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search Jobs</span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
              </button>

              <button
                onClick={() => setActiveTab('saved')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                  activeTab === 'saved'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span className="hidden sm:inline">Saved</span>
                {savedCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-xs">
                    {savedCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('pipeline')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                  activeTab === 'pipeline'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Kanban className="w-4 h-4" />
                <span className="hidden sm:inline">Pipeline</span>
              </button>

              <button
                onClick={() => setActiveTab('resume')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'resume'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Resume</span>
              </button>

              <button
                onClick={() => setActiveTab('logs')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'logs'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Terminal className="w-4 h-4" />
                <span className="hidden sm:inline">CLI Logs</span>
              </button>
            </nav>

            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors relative"
              title="Email Summary Settings"
            >
              <Mail className="w-4 h-4" />
              {emailEnabled && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Daily Job Digest & Email Summary</h3>
                  <p className="text-xs text-slate-500">Powered by SendGrid / Mailgun API Provider</p>
                </div>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmailSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Recipient Email Address
                </label>
                <input
                  type="email"
                  required
                  value={emailAddress}
                  onChange={e => setEmailAddress(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Enable Daily Email Summary</h4>
                  <p className="text-xs text-slate-500">Receive top matching jobs every morning at 8:00 AM</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailEnabled}
                    onChange={e => setEmailEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {statusMessage && (
                <div className={`p-3 rounded-xl text-xs font-medium ${statusMessage.includes('Success') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                  {statusMessage}
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1.5"
                >
                  {loading ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Preferences</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

