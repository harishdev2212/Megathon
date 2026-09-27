import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  RefreshCw, 
  Layers, 
  Terminal, 
  FileCode, 
  GraduationCap,
  Copy,
  Check
} from 'lucide-react';

export default function App() {
  // State for Health Check
  const [healthStatus, setHealthStatus] = useState({
    loading: true,
    healthy: false,
    message: 'Checking backend status...',
    timestamp: null,
  });

  // State for Gemini AI Test
  const [prompt, setPrompt] = useState('Explain photosynthesis in 2 simple sentences with an analogy.');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Check backend health on initial load
  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setHealthStatus(prev => ({ ...prev, loading: true }));
    try {
      const startTime = performance.now();
      const res = await fetch('/api/health');
      const endTime = performance.now();

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setHealthStatus({
        loading: false,
        healthy: true,
        message: data.message || 'Connected to backend',
        timestamp: data.timestamp || new Date().toISOString(),
        latency: Math.round(endTime - startTime)
      });
    } catch (err) {
      setHealthStatus({
        loading: false,
        healthy: false,
        message: 'Could not connect to FastAPI backend at /api/health.',
        error: err.message,
      });
    }
  };

  const handleTestAI = async (e) => {
    e?.preventDefault();
    if (!prompt.trim() || aiLoading) return;

    setAiLoading(true);
    setAiError(null);
    setAiResponse(null);

    try {
      const res = await fetch('/api/ai/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || `Server returned error status ${res.status}`);
      }

      setAiResponse(data.response);
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const promptSuggestions = [
    "Explain photosynthesis in 2 simple sentences with an analogy.",
    "Create 3 multiple-choice quiz questions on Newton's Laws.",
    "Summarize why the French Revolution started in simple bullet points.",
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                EduGenAI
              </span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Hackathon Skeleton
              </span>
            </div>
          </div>

          {/* Health Pill Indicator */}
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${
              healthStatus.loading 
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' 
                : healthStatus.healthy 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                healthStatus.loading 
                  ? 'bg-amber-400 animate-pulse' 
                  : healthStatus.healthy 
                    ? 'bg-emerald-400' 
                    : 'bg-rose-400'
              }`} />
              <span>
                {healthStatus.loading ? 'Checking Backend...' : healthStatus.healthy ? 'Backend Online' : 'Backend Offline'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full space-y-8">
        {/* Hero Section */}
        <section className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Ready for Tomorrow's Problem Statement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-b from-white to-slate-300 bg-clip-text text-transparent">
            Modular Education AI Architecture
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            This scaffold connects a modern React frontend, a FastAPI backend, and Google Gemini via an isolated service layer.
          </p>
        </section>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: AI Test Playground (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-100">Live Gemini API Test</h2>
                  <p className="text-xs text-slate-400">Sends request to <code className="text-purple-300">POST /api/ai/test</code></p>
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div className="space-y-1.5">
              <span className="text-xs text-slate-400 font-medium">Quick education prompts:</span>
              <div className="flex flex-wrap gap-2">
                {promptSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setPrompt(suggestion)}
                    className="text-xs text-left px-3 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700/80 text-slate-300 transition-colors border border-slate-700/50"
                  >
                    "{suggestion}"
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleTestAI} className="space-y-4">
              <div className="relative">
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter a prompt for Gemini..."
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={aiLoading || !prompt.trim()}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Calling Google Gemini...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Prompt to Gemini</span>
                  </>
                )}
              </button>
            </form>

            {/* Response Section */}
            {aiError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>API Error Occurred</span>
                </div>
                <p className="text-xs text-rose-200/90 leading-relaxed font-mono bg-slate-950/50 p-2.5 rounded-lg overflow-x-auto">
                  {aiError}
                </p>
                {aiError.includes('GEMINI_API_KEY') && (
                  <p className="text-xs text-slate-300 pt-1">
                    💡 <strong>Tip for beginners:</strong> Open your <code className="text-purple-300">.env</code> file, set <code className="text-purple-300">GEMINI_API_KEY=your_key</code>, and restart the backend server.
                  </p>
                )}
              </div>
            )}

            {aiResponse && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider text-slate-300">Gemini Response:</span>
                  <button 
                    onClick={() => copyToClipboard(aiResponse)}
                    className="flex items-center gap-1 hover:text-slate-200 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {aiResponse}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Status & Architecture Details (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Backend Connectivity Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-100">Server Status</h3>
                    <p className="text-xs text-slate-400"><code className="text-emerald-300">GET /api/health</code></p>
                  </div>
                </div>
                <button
                  onClick={checkHealth}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Refresh status"
                >
                  <RefreshCw className={`w-4 h-4 ${healthStatus.loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Message:</span>
                  <span className="font-medium text-slate-200">{healthStatus.message}</span>
                </div>
                {healthStatus.latency !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Latency:</span>
                    <span className="text-emerald-400 font-mono">{healthStatus.latency} ms</span>
                  </div>
                )}
                {healthStatus.timestamp && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Server Time:</span>
                    <span className="text-slate-400 font-mono">{new Date(healthStatus.timestamp).toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Architecture Hook Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100">Tomorrow's Hook</h3>
                  <p className="text-xs text-slate-400">Where you plug in your hackathon solution</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5">
                  <FileCode className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono text-purple-300 font-medium">ai/task_engine.py</span>
                    <p className="text-slate-400 mt-0.5">Define your custom logic, education prompts, and grading/quiz rules here.</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5">
                  <Terminal className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono text-indigo-300 font-medium">ai/ai_service.py</span>
                    <p className="text-slate-400 mt-0.5">Encapsulates all Google Gemini SDK calls, API keys, and parameter tuning.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        EduGenAI Hackathon Starter • Built with React, FastAPI & Google Gemini
      </footer>
    </div>
  );
}
