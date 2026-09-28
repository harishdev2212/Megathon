import React, { useState, useEffect, useRef } from 'react';
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
  Check,
  Upload,
  FileText,
  Image as ImageIcon,
  Trash2,
  Play,
  ExternalLink,
  ArrowRight
} from 'lucide-react';

export default function App() {
  // Navigation / Workspace Tabs: 'text' | 'image' | 'documents' | 'tasks'
  const [activeTab, setActiveTab] = useState('text');

  // Backend Health State
  const [healthStatus, setHealthStatus] = useState({
    loading: true,
    healthy: false,
    message: 'Checking backend status...',
    timestamp: null,
    latency: null,
  });

  // Global Toast / Copy Feedback
  const [copiedKey, setCopiedKey] = useState(null);

  // =========================================================================
  // TAB 1: Text Generation State
  // =========================================================================
  const [textPrompt, setTextPrompt] = useState('Explain photosynthesis in 2 simple sentences with an analogy.');
  const [systemInstruction, setSystemInstruction] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [showAdvancedText, setShowAdvancedText] = useState(false);
  const [textLoading, setTextLoading] = useState(false);
  const [textResponse, setTextResponse] = useState(null);
  const [textError, setTextError] = useState(null);

  // =========================================================================
  // TAB 2: Multimodal Image Analysis State
  // =========================================================================
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imagePrompt, setImagePrompt] = useState('Analyze this educational diagram or image and explain key components.');
  const [imageLoading, setImageLoading] = useState(false);
  const [imageResponse, setImageResponse] = useState(null);
  const [imageError, setImageError] = useState(null);
  const imageInputRef = useRef(null);

  // =========================================================================
  // TAB 3: Document / PDF Upload State
  // =========================================================================
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [docLoading, setDocLoading] = useState(false);
  const [docResponse, setDocResponse] = useState(null);
  const [docError, setDocError] = useState(null);
  const docInputRef = useRef(null);

  // =========================================================================
  // TAB 4: Modular Task Engine State
  // =========================================================================
  const [selectedTask, setSelectedTask] = useState('explain');
  const [taskInput, setTaskInput] = useState('Photosynthesis');
  const [taskContext, setTaskContext] = useState('');
  const [taskLoading, setTaskLoading] = useState(false);
  const [taskResponse, setTaskResponse] = useState(null);
  const [taskError, setTaskError] = useState(null);

  // Predefined task presets for the hackathon
  const taskOptions = [
    { id: 'explain', label: 'Explain Concept', desc: 'Explains topics with intuitive analogies' },
    { id: 'quiz', label: 'Generate Quiz', desc: 'Creates 3-question formative assessment' },
    { id: 'summarize', label: 'Summarize Study Material', desc: 'Extracts core ideas and vocabulary' },
    { id: 'analyze_document', label: 'Analyze Document', desc: 'Deep analysis of uploaded text' },
    { id: 'generate_questions', label: 'Generate Questions', desc: 'Creates assessment questions' },
    { id: 'evaluate_answer', label: 'Evaluate Answer', desc: 'Grades student response against rubric' },
    { id: 'generate_learning_plan', label: 'Learning Plan', desc: 'Generates multi-day study roadmap' },
  ];

  // Initial health check
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
        throw new Error(`HTTP ${res.status}: Backend returned unhealthy status.`);
      }

      const data = await res.json();
      setHealthStatus({
        loading: false,
        healthy: true,
        message: data.message || 'Connected to FastAPI backend',
        timestamp: data.timestamp || new Date().toISOString(),
        latency: Math.round(endTime - startTime),
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

  const copyToClipboard = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // =========================================================================
  // Action Handlers
  // =========================================================================

  // 1. Text Generation Handler
  const handleGenerateText = async (e) => {
    e?.preventDefault();
    if (!textPrompt.trim() || textLoading) return;

    setTextLoading(true);
    setTextError(null);
    setTextResponse(null);

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textPrompt.trim(),
          system_instruction: systemInstruction.trim() || null,
          temperature: parseFloat(temperature),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || `Server returned error status ${res.status}`);
      }
      setTextResponse(data.response);
    } catch (err) {
      setTextError(err.message);
    } finally {
      setTextLoading(false);
    }
  };

  // 2. Multimodal Image Analysis Handler
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file (.png, .jpg, .jpeg, .webp)');
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setImageError(null);
    setImageResponse(null);
  };

  const clearSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageResponse(null);
    setImageError(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleAnalyzeImage = async (e) => {
    e?.preventDefault();
    if (!selectedImage || imageLoading) return;

    setImageLoading(true);
    setImageError(null);
    setImageResponse(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedImage);
      formData.append('prompt', imagePrompt.trim() || 'Analyze this image in detail.');

      const res = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || `Server returned error status ${res.status}`);
      }
      setImageResponse(data.response);
    } catch (err) {
      setImageError(err.message);
    } finally {
      setImageLoading(false);
    }
  };

  // 3. Document / PDF Upload Handler
  const handleDocFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedDoc(file);
    setDocError(null);
    setDocResponse(null);
  };

  const handleUploadDocument = async (e) => {
    e?.preventDefault();
    if (!selectedDoc || docLoading) return;

    setDocLoading(true);
    setDocError(null);
    setDocResponse(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedDoc);

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || `Server returned error status ${res.status}`);
      }
      setDocResponse(data);
    } catch (err) {
      setDocError(err.message);
    } finally {
      setDocLoading(false);
    }
  };

  // 4. Task Engine Handler
  const handleExecuteTask = async (e) => {
    e?.preventDefault();
    if (taskLoading) return;

    setTaskLoading(true);
    setTaskError(null);
    setTaskResponse(null);

    try {
      const res = await fetch('/api/ai/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_type: selectedTask,
          user_input: taskInput.trim(),
          context: taskContext.trim() || null,
          payload: {
            user_input: taskInput.trim(),
            context: taskContext.trim() || null,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || `Task execution failed (${res.status})`);
      }
      setTaskResponse(data.result);
    } catch (err) {
      setTaskError(err.message);
    } finally {
      setTaskLoading(false);
    }
  };

  // Quick Action: Send extracted document text to text generator
  const sendDocTextToGenerator = () => {
    if (!docResponse?.extracted_text) return;
    setTextPrompt(`Summarize key concepts from this document:\n\n${docResponse.extracted_text.slice(0, 3000)}`);
    setActiveTab('text');
  };

  const promptSuggestions = [
    "Explain photosynthesis in 2 simple sentences with an analogy.",
    "Create 3 multiple-choice quiz questions on Newton's Laws with answer keys.",
    "Summarize why the Industrial Revolution began in 4 bullet points.",
    "Act as an educational coach and critique my understanding of mitochondria.",
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500/30">
      
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  EduGenAI Workspace
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  Hackathon Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-400">FastAPI • Google Gemini • React Vite</p>
            </div>
          </div>

          {/* Right Status Pill & Docs Link */}
          <div className="flex items-center gap-3">
            <a 
              href="http://localhost:8000/docs" 
              target="_blank" 
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-700/60"
            >
              <span>Swagger API Docs</span>
              <ExternalLink className="w-3 h-3" />
            </a>

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
                  {healthStatus.loading 
                    ? 'Checking...' 
                    : healthStatus.healthy 
                      ? `Online${healthStatus.latency ? ` (${healthStatus.latency}ms)` : ''}` 
                      : 'Backend Offline'}
                </span>
              </div>

              <button
                onClick={checkHealth}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors border border-slate-700/60"
                title="Ping Backend Health"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${healthStatus.loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full space-y-6">
        
        {/* Workspace Mode Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800/80 pb-3">
          <button
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'text'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Text Generation</span>
          </button>

          <button
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'image'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Multimodal Vision</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'documents'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Document / PDF Upload</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'tasks'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Modular Task Engine</span>
          </button>
        </div>

        {/* 2-Column Responsive Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Action Panel (7 Columns) */}
          <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-6">
            
            {/* =============================================================== */}
            {/* MODE 1: Text Generation */}
            {/* =============================================================== */}
            {activeTab === 'text' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-slate-100">Gemini Text Generation</h2>
                      <p className="text-xs text-slate-400">Endpoint: <code className="text-purple-300">POST /api/ai/generate</code></p>
                    </div>
                  </div>
                </div>

                {/* Suggestions */}
                <div className="space-y-1.5">
                  <span className="text-xs text-slate-400 font-medium">Quick education starters:</span>
                  <div className="flex flex-wrap gap-2">
                    {promptSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setTextPrompt(suggestion)}
                        className="text-xs text-left px-2.5 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-700/80 text-slate-300 transition-colors border border-slate-700/50"
                      >
                        "{suggestion.length > 50 ? suggestion.slice(0, 50) + '...' : suggestion}"
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleGenerateText} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Prompt or Educational Query:
                    </label>
                    <textarea
                      rows={4}
                      value={textPrompt}
                      onChange={(e) => setTextPrompt(e.target.value)}
                      placeholder="Ask Gemini to explain, generate, or assess..."
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  {/* Advanced Options Toggle */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowAdvancedText(!showAdvancedText)}
                      className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
                    >
                      <span>{showAdvancedText ? 'Hide' : 'Show'} Advanced Options (System Persona & Temperature)</span>
                    </button>

                    {showAdvancedText && (
                      <div className="mt-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">
                            System Instruction (Persona / Role):
                          </label>
                          <input
                            type="text"
                            value={systemInstruction}
                            onChange={(e) => setSystemInstruction(e.target.value)}
                            placeholder="e.g. You are an expert STEM tutor who uses Socratic questioning."
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Temperature: {temperature}</span>
                            <span>{temperature < 0.4 ? 'Deterministic' : temperature > 0.8 ? 'Creative' : 'Balanced'}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={temperature}
                            onChange={(e) => setTemperature(e.target.value)}
                            className="w-full accent-purple-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={textLoading || !textPrompt.trim()}
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {textLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Generating Response...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Generate with Gemini</span>
                        </>
                      )}
                    </button>

                    {textPrompt && (
                      <button
                        type="button"
                        onClick={() => setTextPrompt('')}
                        className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                        title="Clear input"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </form>

                {/* Error Banner */}
                {textError && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm space-y-2">
                    <div className="flex items-center gap-2 font-medium">
                      <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      <span>API Error</span>
                    </div>
                    <p className="text-xs font-mono bg-slate-950/60 p-2.5 rounded-lg overflow-x-auto">
                      {textError}
                    </p>
                    {textError.includes('GEMINI_API_KEY') && (
                      <p className="text-xs text-slate-300">
                        💡 Set <code className="text-purple-300">GEMINI_API_KEY</code> in your <code className="text-purple-300">.env</code> file and restart the backend.
                      </p>
                    )}
                  </div>
                )}

                {/* Response Area */}
                {textResponse && (
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold uppercase tracking-wider text-slate-300">AI Response:</span>
                      <button 
                        onClick={() => copyToClipboard(textResponse, 'text')}
                        className="flex items-center gap-1 hover:text-slate-200 transition-colors"
                      >
                        {copiedKey === 'text' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'text' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans max-h-96 overflow-y-auto">
                      {textResponse}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =============================================================== */}
            {/* MODE 2: Multimodal Image Analysis */}
            {/* =============================================================== */}
            {activeTab === 'image' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-slate-100">Multimodal Image Analysis</h2>
                      <p className="text-xs text-slate-400">Endpoint: <code className="text-indigo-300">POST /api/ai/analyze-image</code></p>
                    </div>
                  </div>
                </div>

                {/* Image Upload Zone */}
                <div>
                  <input
                    type="file"
                    ref={imageInputRef}
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={handleImageFileChange}
                    className="hidden"
                    id="image-upload-input"
                  />

                  {!selectedImage ? (
                    <label
                      htmlFor="image-upload-input"
                      className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-950/40 hover:bg-slate-950/80 transition-all text-center space-y-2"
                    >
                      <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-medium text-slate-200">
                        Click to upload an educational diagram or photo
                      </span>
                      <span className="text-xs text-slate-500">
                        Supports PNG, JPG, JPEG, WEBP (up to 20MB)
                      </span>
                    </label>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <img 
                          src={imagePreview} 
                          alt="Upload preview" 
                          className="w-16 h-16 rounded-lg object-cover border border-slate-700/80 flex-shrink-0"
                        />
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium text-slate-200 truncate">{selectedImage.name}</p>
                          <p className="text-xs text-slate-400">
                            {(selectedImage.size / 1024).toFixed(1)} KB • {selectedImage.type}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={clearSelectedImage}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Remove image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Instruction Input */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Prompt / Instructions for Image:
                  </label>
                  <textarea
                    rows={3}
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="What should Gemini inspect in this image?"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  onClick={handleAnalyzeImage}
                  disabled={imageLoading || !selectedImage}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {imageLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Analyzing Visuals with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Analyze Image</span>
                    </>
                  )}
                </button>

                {/* Error Banner */}
                {imageError && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm space-y-2">
                    <div className="flex items-center gap-2 font-medium">
                      <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      <span>Vision Error</span>
                    </div>
                    <p className="text-xs font-mono bg-slate-950/60 p-2.5 rounded-lg overflow-x-auto">
                      {imageError}
                    </p>
                  </div>
                )}

                {/* Vision Response */}
                {imageResponse && (
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold uppercase tracking-wider text-slate-300">Visual Analysis Result:</span>
                      <button 
                        onClick={() => copyToClipboard(imageResponse, 'image')}
                        className="flex items-center gap-1 hover:text-slate-200 transition-colors"
                      >
                        {copiedKey === 'image' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'image' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans max-h-96 overflow-y-auto">
                      {imageResponse}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =============================================================== */}
            {/* MODE 3: Document / PDF Upload */}
            {/* =============================================================== */}
            {activeTab === 'documents' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-slate-100">Document & PDF Upload</h2>
                      <p className="text-xs text-slate-400">Endpoint: <code className="text-blue-300">POST /api/documents/upload</code></p>
                    </div>
                  </div>
                </div>

                {/* Document Picker */}
                <div>
                  <input
                    type="file"
                    ref={docInputRef}
                    accept=".pdf,.txt,.md"
                    onChange={handleDocFileChange}
                    className="hidden"
                    id="doc-upload-input"
                  />

                  <label
                    htmlFor="doc-upload-input"
                    className="border-2 border-dashed border-slate-700 hover:border-blue-500/60 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-950/40 hover:bg-slate-950/80 transition-all text-center space-y-2"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium text-slate-200">
                      {selectedDoc ? selectedDoc.name : 'Click to select a PDF or Text Document'}
                    </span>
                    <span className="text-xs text-slate-500">
                      Extracts text from PDF, TXT, or Markdown using pypdf
                    </span>
                  </label>
                </div>

                {/* Upload Button */}
                <button
                  type="button"
                  onClick={handleUploadDocument}
                  disabled={docLoading || !selectedDoc}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {docLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Parsing Document with pypdf...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload & Extract Text</span>
                    </>
                  )}
                </button>

                {/* Error Banner */}
                {docError && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm space-y-2">
                    <div className="flex items-center gap-2 font-medium">
                      <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      <span>Document Error</span>
                    </div>
                    <p className="text-xs font-mono bg-slate-950/60 p-2.5 rounded-lg overflow-x-auto">
                      {docError}
                    </p>
                  </div>
                )}

                {/* Extracted Document Info & Text */}
                {docResponse && (
                  <div className="space-y-4 pt-2 border-t border-slate-800/80">
                    {/* Metadata Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">File Size:</span>
                        <span className="font-semibold text-slate-200">{docResponse.file_size_readable}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Pages:</span>
                        <span className="font-semibold text-slate-200">{docResponse.page_count}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Words:</span>
                        <span className="font-semibold text-slate-200">{docResponse.word_count}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Characters:</span>
                        <span className="font-semibold text-slate-200">{docResponse.char_count}</span>
                      </div>
                    </div>

                    {/* Quick Action to Generator */}
                    <button
                      type="button"
                      onClick={sendDocTextToGenerator}
                      className="w-full py-2 px-3 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Send Extracted Text to Prompt Generator</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Text Preview Box */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-semibold text-slate-300">Extracted Text Content:</span>
                        <button 
                          onClick={() => copyToClipboard(docResponse.extracted_text, 'doc')}
                          className="flex items-center gap-1 hover:text-slate-200 transition-colors"
                        >
                          {copiedKey === 'doc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'doc' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
                        {docResponse.extracted_text}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =============================================================== */}
            {/* MODE 4: Modular Task Engine */}
            {/* =============================================================== */}
            {activeTab === 'tasks' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-slate-100">Modular Task Engine</h2>
                      <p className="text-xs text-slate-400">Extension point: <code className="text-emerald-300">ai/task_engine.py</code></p>
                    </div>
                  </div>
                </div>

                {/* Task Selection Grid */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-300">
                    Select Modular Task:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {taskOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedTask(opt.id)}
                        className={`text-left p-3 rounded-xl border text-xs transition-all ${
                          selectedTask === opt.id
                            ? 'bg-purple-600/20 border-purple-500 text-purple-200 shadow-sm'
                            : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="font-semibold text-slate-200">{opt.label}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Task Inputs */}
                <form onSubmit={handleExecuteTask} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Primary Task Input (Topic / Question / Concept):
                    </label>
                    <input
                      type="text"
                      value={taskInput}
                      onChange={(e) => setTaskInput(e.target.value)}
                      placeholder="e.g. Newton's Third Law, Mitosis, Renaissance..."
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Optional Context / Rubric / Document Material:
                    </label>
                    <textarea
                      rows={2}
                      value={taskContext}
                      onChange={(e) => setTaskContext(e.target.value)}
                      placeholder="Paste background text or grading rubric if applicable..."
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={taskLoading || !taskInput.trim()}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {taskLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Executing {selectedTask}...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Execute Modular Task</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Error Banner */}
                {taskError && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm space-y-2">
                    <div className="flex items-center gap-2 font-medium">
                      <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      <span>Task Error</span>
                    </div>
                    <p className="text-xs font-mono bg-slate-950/60 p-2.5 rounded-lg overflow-x-auto">
                      {taskError}
                    </p>
                  </div>
                )}

                {/* Task Result View */}
                {taskResponse && (
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold uppercase tracking-wider text-slate-300">Task Output:</span>
                      <button 
                        onClick={() => copyToClipboard(JSON.stringify(taskResponse, null, 2), 'task')}
                        className="flex items-center gap-1 hover:text-slate-200 transition-colors"
                      >
                        {copiedKey === 'task' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'task' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans max-h-96 overflow-y-auto">
                      {taskResponse.explanation || taskResponse.quiz || taskResponse.summary || taskResponse.analysis || taskResponse.evaluation || taskResponse.learning_plan || taskResponse.result || JSON.stringify(taskResponse, null, 2)}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Right Sidebar: Status & Extension Guide (5 Columns) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Backend Connectivity Status Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-100">Backend Status</h3>
                    <p className="text-[11px] text-slate-400">FastAPI Server at <code className="text-emerald-300">127.0.0.1:8000</code></p>
                  </div>
                </div>
                <button
                  onClick={checkHealth}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Refresh status"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${healthStatus.loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Health State:</span>
                  <span className={`font-medium ${healthStatus.healthy ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {healthStatus.healthy ? 'Operational' : 'Unavailable'}
                  </span>
                </div>
                {healthStatus.latency !== null && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">API Latency:</span>
                    <span className="text-emerald-400 font-mono">{healthStatus.latency} ms</span>
                  </div>
                )}
                {healthStatus.timestamp && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Last Ping:</span>
                    <span className="text-slate-400 font-mono">{new Date(healthStatus.timestamp).toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Architecture Hook: Tomorrow's Extension Points */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm space-y-3.5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-100">Tomorrow's Extension Points</h3>
                  <p className="text-[11px] text-slate-400">Where to plug in the hackathon challenge</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5">
                  <FileCode className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono text-purple-300 font-medium">ai/task_engine.py</span>
                    <p className="text-slate-400 mt-0.5 text-[11px]">
                      Register problem-specific tasks here using <code className="text-purple-300">@task_dispatcher.register</code>.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5">
                  <Terminal className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono text-indigo-300 font-medium">ai/ai_service.py</span>
                    <p className="text-slate-400 mt-0.5 text-[11px]">
                      Encapsulates Gemini text generation, image inspection, and model selection.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5">
                  <FileText className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono text-blue-300 font-medium">backend/app/api/</span>
                    <p className="text-slate-400 mt-0.5 text-[11px]">
                      REST routers for AI, health, and documents. Automatic OpenAPI docs at <code className="text-blue-300">/docs</code>.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Flow Reference */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400">
              <span className="font-semibold text-slate-200 block mb-1">Architecture Flow:</span>
              <div className="font-mono text-[11px] bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 text-slate-300">
                React UI → FastAPI → ai_service → Gemini → Structured Response
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        EduGenAI Hackathon Starter • React Vite + FastAPI + Google Gemini
      </footer>
    </div>
  );
}
