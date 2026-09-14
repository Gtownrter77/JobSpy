import React from 'react';
import { Terminal, Copy, Check } from 'lucide-react';

interface TerminalLogsProps {
  logs: string[];
}

export const TerminalLogs: React.FC<TerminalLogsProps> = ({ logs }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(logs.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden font-mono text-xs">
      <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2 text-slate-400">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-200">JobSpy CLI Output & Runtime Logs</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy Logs'}</span>
        </button>
      </div>
      <div className="p-6 space-y-2 max-h-[500px] overflow-y-auto text-emerald-400">
        {logs.length === 0 ? (
          <p className="text-slate-500 italic">No scrape logs yet. Run a job search to see JobSpy CLI output.</p>
        ) : (
          logs.map((log, idx) => (
            <div key={idx} className="flex items-start space-x-2">
              <span className="text-slate-600 select-none">$</span>
              <span className="text-slate-200">{log}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
