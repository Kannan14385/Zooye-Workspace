import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, X, ExternalLink, ShieldCheck, Clock, Send } from 'lucide-react';
import { EmailDispatchLog, WorkspaceUser } from '../types';

export const RealtimeEmailToast: React.FC = () => {
  const [activeToast, setActiveToast] = useState<{
    recipient: WorkspaceUser;
    sender: WorkspaceUser;
    task: any;
    emailLog: EmailDispatchLog;
  } | null>(null);

  const [previewLog, setPreviewLog] = useState<EmailDispatchLog | null>(null);

  useEffect(() => {
    const handleEmailDispatched = (event: any) => {
      const data = event.detail;
      if (data) {
        setActiveToast(data);
        // Auto-hide toast after 7 seconds
        const timer = setTimeout(() => {
          setActiveToast(null);
        }, 7000);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('workspace:email_dispatched', handleEmailDispatched);
    return () => {
      window.removeEventListener('workspace:email_dispatched', handleEmailDispatched);
    };
  }, []);

  return (
    <>
      {/* Real-Time Floating Banner */}
      {activeToast && (
        <div className="fixed top-5 right-5 z-50 max-w-md w-full animate-in slide-in-from-top-4 duration-300">
          <div className="bg-stone-900 border-2 border-amber-400 text-stone-100 rounded-2xl shadow-2xl p-4 overflow-hidden relative">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-400 border border-amber-400/40 flex items-center justify-center shrink-0">
                <Send className="w-4 h-4 animate-pulse" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Real-Time Email Dispatched</span>
                  </span>
                  <button
                    onClick={() => setActiveToast(null)}
                    className="text-stone-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs font-semibold text-white mt-1">
                  Work Assigned by Superior: {activeToast.sender.name}
                </p>

                <p className="text-xs text-stone-300 mt-0.5 line-clamp-1">
                  To: <span className="font-mono text-amber-300">{activeToast.recipient.email}</span>
                </p>

                <div className="p-2 bg-stone-950/80 rounded-lg border border-stone-800 mt-2 text-[11px] space-y-0.5">
                  <div className="text-stone-300 font-medium truncate">
                    📋 {activeToast.task.title}
                  </div>
                  <div className="flex items-center gap-2 text-stone-400 text-[10px]">
                    <span className="text-rose-400 font-bold">
                      Priority: {activeToast.task.priority || 'Normal'}
                    </span>
                    <span>•</span>
                    <span>Due: {activeToast.task.dueDate || 'Sprint Cadence'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => {
                      setPreviewLog(activeToast.emailLog);
                      setActiveToast(null);
                    }}
                    className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>View Dispatched Email</span>
                  </button>
                  <button
                    onClick={() => setActiveToast(null)}
                    className="px-3 py-1.5 text-stone-400 hover:text-stone-200 text-xs font-medium"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formatted Email Preview Modal */}
      {previewLog && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Dispatched Email Notification</h3>
                  <p className="text-[11px] text-stone-400 font-mono">SMTP Delivery Verified • 250 OK</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewLog(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email Headers */}
            <div className="p-4 bg-stone-900/60 border-b border-stone-800 text-xs space-y-1.5 font-mono">
              <div className="flex gap-2">
                <span className="text-stone-500 w-16">FROM:</span>
                <span className="text-amber-400 font-semibold">
                  {previewLog.fromName} ({previewLog.fromRole.toUpperCase()}) &lt;superior@acmeoffice.internal&gt;
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-stone-500 w-16">TO:</span>
                <span className="text-stone-200">
                  {previewLog.toName} &lt;{previewLog.toEmail}&gt;
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-stone-500 w-16">DATE:</span>
                <span className="text-stone-400">{new Date(previewLog.timestamp).toLocaleString()}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-stone-500 w-16">SUBJECT:</span>
                <span className="text-white font-bold">{previewLog.subject}</span>
              </div>
            </div>

            {/* Email Body */}
            <div className="p-5 flex-1 overflow-y-auto text-xs sm:text-sm text-stone-200 font-sans whitespace-pre-wrap leading-relaxed bg-stone-950/40">
              {previewLog.body}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
                <ShieldCheck className="w-4 h-4" />
                <span>Encrypted TLS 1.3 Transmission Verified</span>
              </div>
              <button
                onClick={() => setPreviewLog(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-xl font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
