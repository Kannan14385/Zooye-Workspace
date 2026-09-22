import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  User,
  Send,
  X,
  Sparkles,
  Clock,
  Trash2,
  Download,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Maximize2,
  Minimize2,
  MessageSquare,
  FileText,
  Mail,
  ListTodo,
} from 'lucide-react';
import { WorkspaceUser, KanbanTask, InboxNotification, ChatMessage } from '../types';

interface GeminiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: WorkspaceUser;
  tasks: KanbanTask[];
  notifications: InboxNotification[];
  currentPageTitle: string;
  onNavigateToTask?: (taskId: string) => void;
  onCommand?: (prompt: string) => string | null;
}

export const GeminiAssistantModal: React.FC<GeminiAssistantModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  tasks,
  notifications,
  currentPageTitle,
  onNavigateToTask,
  onCommand,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const storageKey = `notion_thozha_chat_history_${currentUser.id}`;

  // Filter tasks assigned to current user
  const assignedTasks = tasks.filter(
    (t) =>
      t.assignee?.id === currentUser.id ||
      t.assignee?.email?.toLowerCase() === currentUser.email?.toLowerCase() ||
      t.assignee?.name?.toLowerCase() === currentUser.name?.toLowerCase()
  );

  // Filter unread notifications for current user
  const userNotifications = notifications.filter(
    (n) => n.recipientId === currentUser.id || n.recipientEmail === currentUser.email
  );

  // Load chat history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey) || localStorage.getItem(`notion_gemini_chat_history_${currentUser.id}`);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        // Welcome greeting with deadline & work assignment preview
        const initialGreeting: ChatMessage = {
          id: 'msg-' + Date.now(),
          sender: 'assistant',
          content: `👋 Hello **${currentUser.name}**! I am **Thozha**, your Notion AI workspace companion and personal assistant.\n\nI am currently monitoring your workspace:\n- 📋 **${assignedTasks.length} task${assignedTasks.length === 1 ? '' : 's'}** assigned to you in Sprint Kanban\n- 📥 **${userNotifications.length} notification${userNotifications.length === 1 ? '' : 's'}** in your Inbox\n- ⏰ Continuous tracking of sprint deadlines & superior intimations\n\nHow can I help you work on Notion today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages([initialGreeting]);
      }
    } catch {
      // Fallback
    }
  }, [currentUser.id]);

  // Persist messages whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(messages));
      } catch (e) {
        console.warn('Failed to save chat history:', e);
      }
    }
  }, [messages, storageKey]);

  // Auto-scroll to bottom of thread
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isLoading) return;

    const userMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputPrompt('');
    setIsLoading(true);

    const commandResult = onCommand?.(prompt);
    if (commandResult) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'msg-' + (Date.now() + 1),
          sender: 'assistant',
          content: commandResult,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          history: updatedMessages.map((m) => ({ sender: m.sender, content: m.content })),
          userContext: {
            userName: currentUser.name,
            userRole: currentUser.role,
            userEmail: currentUser.email,
            currentPageTitle,
            assignedTasks: assignedTasks.map((t) => ({
              id: t.id,
              title: t.title,
              priority: t.priority,
              status: t.status,
              dueDate: t.dueDate,
            })),
            unreadNotifications: userNotifications.map((n) => ({
              type: n.type,
              title: n.title,
              senderName: n.senderName,
              message: n.message,
            })),
            upcomingDeadlines: assignedTasks.map(
              (t) => `"${t.title}" (${t.priority}) due: ${t.dueDate || 'Sprint cadence'}`
            ),
          },
        }),
      });

      const data = await response.json();
      const replyText = data.reply || 'I am ready to help you with your tasks and Notion workspace.';

      const assistantMessage: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'assistant',
        content: `⚠️ Note: I am currently responding in offline assistant mode. You have **${assignedTasks.length} assigned tasks** in your queue. Let me know if you would like me to list them or help organize your notes!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear all conversation history with Thozha?')) {
      localStorage.removeItem(storageKey);
      const resetGreeting: ChatMessage = {
        id: 'msg-' + Date.now(),
        sender: 'assistant',
        content: `Conversation history reset. Hello ${currentUser.name}! I am Thozha, your AI companion. How can I help you with your deadlines and Notion tasks today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([resetGreeting]);
    }
  };

  const handleExportTranscript = () => {
    const transcript = messages
      .map((m) => `[${m.timestamp}] ${m.sender.toUpperCase()}:\n${m.content}\n`)
      .join('\n---\n\n');
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thozha-chat-${currentUser.name.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-end sm:items-center justify-end sm:justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`thozha-modal bg-stone-900 border border-stone-800 text-stone-100 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 w-full ${
          isExpanded
            ? 'h-[95vh] sm:max-w-4xl'
            : 'h-[85vh] sm:h-[650px] sm:max-w-xl'
        }`}
      >
        {/* Top Header */}
        <header className="p-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-stone-950 flex items-center justify-center font-bold shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white">Thozha AI Copilot</h3>
                <span className="text-[10px] font-mono uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                  gemini-3.5-flash
                </span>
              </div>
              <p className="text-[11px] text-stone-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active Companion for {currentUser.name} • {currentUser.role.toUpperCase()}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleExportTranscript}
              title="Export Conversation Transcript"
              className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleClearHistory}
              title="Clear Conversation History"
              className="p-2 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-stone-800 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Restore Size' : 'Expand View'}
              className="hidden sm:block p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              title="Close Assistant"
              className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Live Context Banner */}
        <div className="bg-stone-950/60 border-b border-stone-800/80 px-4 py-2 flex items-center justify-between text-xs text-stone-400 overflow-x-auto shrink-0 gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Deadlines Monitored: <strong className="text-white">{assignedTasks.length} tasks</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Inbox Alerts: <strong className="text-white">{userNotifications.length} items</strong></span>
          </div>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 border border-amber-400/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-amber-400 text-stone-950 font-medium rounded-tr-sm shadow-md'
                        : 'bg-stone-800/90 text-stone-100 border border-stone-700/80 rounded-tl-sm shadow-md'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-stone-500 font-mono mt-1 block px-1">
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-amber-400 shrink-0 mt-0.5"
                  />
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 border border-amber-400/30 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 bg-stone-800/90 border border-stone-700/80 rounded-2xl rounded-tl-sm text-xs text-stone-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                <span>Gemini is analyzing your Notion workspace & deadlines...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 bg-stone-950 border-t border-stone-800 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
          <button
            onClick={() => handleSendMessage('What are my upcoming deadlines? Please intimate target dates.')}
            className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white rounded-full border border-stone-800 shrink-0 transition-colors flex items-center gap-1.5"
          >
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Intimate Deadlines</span>
          </button>
          <button
            onClick={() => handleSendMessage('What tasks were assigned to me by my superiors (Elena / David)?')}
            className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white rounded-full border border-stone-800 shrink-0 transition-colors flex items-center gap-1.5"
          >
            <ListTodo className="w-3 h-3 text-amber-400" />
            <span>Work Assigned by Superiors</span>
          </button>
          <button
            onClick={() => handleSendMessage('Summarize my inbox notifications and real-time email logs.')}
            className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white rounded-full border border-stone-800 shrink-0 transition-colors flex items-center gap-1.5"
          >
            <Mail className="w-3 h-3 text-amber-400" />
            <span>Summarize Inbox</span>
          </button>
          <button
            onClick={() => handleSendMessage('Help me draft a structured specification document in Notion.')}
            className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white rounded-full border border-stone-800 shrink-0 transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3 h-3 text-amber-400" />
            <span>Draft in Notion</span>
          </button>
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-stone-950 border-t border-stone-800 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={`Ask Thozha about deadlines, assigned work, or Notion drafting...`}
            className="flex-1 bg-stone-900 border border-stone-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="p-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-stone-950 font-bold rounded-xl transition-all shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
