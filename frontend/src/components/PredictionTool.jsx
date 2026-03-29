import { useState, useEffect, useRef } from 'react';
import {
  Upload, Video, ArrowRight, Loader2, CheckCircle,
  Activity, Music2, Zap, BarChart3, ChevronDown, ChevronUp,
  Plus, BrainCircuit, Cpu
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

/* Animate a number from 0 → target over `duration` ms with ease-out */
function useCountUp(target, duration = 1400) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (target === null || target === undefined) return;
    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      setValue(Math.floor(target * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}

function extractYouTubeVideoUrl(input) {
  try {
    const parsed = new URL(input.trim());
    const isYouTube =
      parsed.hostname === 'www.youtube.com' ||
      parsed.hostname === 'youtube.com' ||
      parsed.hostname === 'youtu.be';
    if (!isYouTube) return null;

    let videoId = null;
    if (parsed.hostname === 'youtu.be') {
      videoId = parsed.pathname.slice(1);
    } else {
      videoId = parsed.searchParams.get('v');
    }

    if (!videoId) return null;
    return `https://www.youtube.com/watch?v=${videoId}`;
  } catch {
    return null;
  }
}

export default function PredictionTool() {
  const [activeTab, setActiveTab]       = useState('url');
  const [loading, setLoading]           = useState(false);
  const [result, setResult]             = useState(null);
  const [showFeatures, setShowFeatures] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedModel, setSelectedModel] = useState('neural_network');

  const [url, setUrl]           = useState('');
  const [urlError, setUrlError] = useState('');
  const [fileError, setFileError] = useState('');
  const [file, setFile] = useState(null);
  const [meta, setMeta] = useState({
    subscribers: '', uploads: '', weekday: 'Monday',
    title: '', description: '', tags: ''
  });

  const audioFeatures = [
    { label: 'Tempo',  icon: Activity,  key: 'Tempo',                  unit: 'BPM', isRound: true },
    { label: 'Energy', icon: Zap,       key: 'RMSE_Mean',              isFixed: 3 },
    { label: 'Pitch',  icon: Music2,    key: 'Spectral_Centroid_Mean', unit: 'Hz',  isRound: true },
    { label: 'Noise',  icon: BarChart3, key: 'ZCR_Mean',               isFixed: 3 },
  ];

  const animatedViews = useCountUp(result?.predicted_views ?? null);

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setShowFeatures(false);

    try {
      let response;
      if (activeTab === 'url') {
        response = await api.post('/predict/url', {
          youtube_url: url,
          model_type: selectedModel,
        });
      } else {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('subscribers', meta.subscribers);
        formData.append('uploads', meta.uploads);
        formData.append('weekday', meta.weekday);
        formData.append('title', meta.title);
        formData.append('description', meta.description);
        formData.append('tags', meta.tags);
        formData.append('model_type', selectedModel);

        response = await api.post('/predict/file', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setResult(response.data);
      toast.success('Prediction Complete!');
    } catch (error) {
      console.error(error);
      toast.error('Prediction Failed.');
    } finally {
      setLoading(false);
    }
  };

  const audioKey = result?.audio_key ?? null;

  return (
    <div
      className="w-full bg-slate-900/70 backdrop-blur-sm border border-slate-700/60 overflow-hidden mt-8 bracket-corner relative"
      style={{ boxShadow: '0 0 40px rgba(6, 182, 212, 0.06), 0 4px 30px rgba(0,0,0,0.5)' }}
    >
      {/* Scan-line overlay */}
      <div className="scanline" />

      {/* ── Terminal title bar ── */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-950/70 border-b border-slate-800/80">
        {/* macOS-style dots */}
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        </div>
        <span className="flex-1 text-center text-xs font-mono text-slate-600 select-none">
          musicular_ai — prediction_engine v2.0
        </span>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
          </span>
          <span className="text-xs font-mono text-green-400/60 uppercase tracking-wider">ONLINE</span>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-slate-700/60">
        {[
          { id: 'url',    icon: Video, label: 'YouTube Link' },
          { id: 'upload', icon: Upload,  label: 'Upload Audio' },
        ].map(({ id, icon: Icon, label }, idx) => (
          <button
            key={id}
            onClick={() => { setActiveTab(id); setResult(null); }}
            className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-bold transition-all
              ${idx === 0 ? 'border-r border-slate-700/60' : ''}
              ${activeTab === id
                ? 'bg-cyan-500/8 text-cyan-400 border-b-2 border-b-cyan-500/70'
                : 'bg-transparent text-slate-500 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="p-8">
        <form onSubmit={handlePredict} className="space-y-6">

          {/* ── Model selector ── */}
          <div className="bg-slate-800/40 border border-slate-700/50 p-4">
            <label className="flex items-center gap-2 section-label mb-3">
              <BrainCircuit className="w-4 h-4 text-cyan-500" /> AI Architecture
            </label>
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-slate-900/70 border border-slate-600/50 text-slate-200 p-3 appearance-none cursor-pointer outline-none hover:border-cyan-500/40 focus:border-cyan-500/60 transition-all font-medium text-sm"
              >
                <option value="neural_network">Deep Neural Network (Standard)</option>
                <option value="gbm">GBM (High Accuracy)</option>
              </select>
              <div className="absolute right-3 top-3.5 pointer-events-none">
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </div>
            </div>
          </div>

          {/* ── Input area ── */}
          {activeTab === 'url' ? (
            <div>
              <label className="block section-label mb-2">YouTube Video URL</label>
              <input
                type="text" required placeholder="https://youtube.com/watch?v=..."
                className={`input-cyber ${urlError ? 'border-red-500/70' : ''}`}
                value={url}
                onChange={(e) => {
                  const raw = e.target.value;
                  setUrl(raw);
                  if (!raw) { setUrlError(''); return; }
                  const clean = extractYouTubeVideoUrl(raw);
                  if (!clean) {
                    setUrlError('Invalid URL. Please enter a valid YouTube video link.');
                  } else {
                    setUrl(clean);
                    setUrlError('');
                  }
                }}
              />
              {urlError && (
                <p className="mt-1.5 text-xs text-red-400">{urlError}</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block section-label mb-2">Upload Audio File</label>
                <input
                  type="file" required accept=".mp3,.wav,audio/mpeg,audio/wav"
                  className={`w-full bg-slate-900/70 border p-2 text-sm text-slate-300
                    file:mr-4 file:py-2 file:px-4 file:border-0 file:border-r file:border-slate-600/50
                    file:text-sm file:font-bold file:bg-slate-800 file:text-cyan-400
                    hover:file:bg-cyan-500/15 hover:file:text-cyan-300 file:transition-colors file:cursor-pointer
                    ${fileError ? 'border-red-500/70' : 'border-slate-600/50'}`}
                  onChange={(e) => {
                    const selected = e.target.files[0];
                    if (!selected) { setFile(null); setFileError(''); return; }
                    const ext = selected.name.split('.').pop().toLowerCase();
                    if (ext !== 'mp3' && ext !== 'wav') {
                      setFile(null);
                      setFileError('Invalid file type. Only .mp3 and .wav files are accepted.');
                      e.target.value = '';
                    } else {
                      setFile(selected);
                      setFileError('');
                    }
                  }}
                />
                {fileError && (
                  <p className="mt-1.5 text-xs text-red-400">{fileError}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block section-label mb-1.5">Subscribers</label>
                  <input type="number" required className="input-cyber"
                    onChange={e => setMeta({ ...meta, subscribers: e.target.value })} />
                </div>
                <div>
                  <label className="block section-label mb-1.5">Total Uploads</label>
                  <input type="number" required className="input-cyber"
                    onChange={e => setMeta({ ...meta, uploads: e.target.value })} />
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-cyan-400 transition-colors"
                >
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {showAdvanced ? 'Hide Details' : 'Add Title, Description & Tags'}
                </button>
              </div>

              {showAdvanced && (
                <div className="space-y-4 p-4 bg-slate-800/30 border border-slate-700/40 reveal">
                  <div>
                    <label className="block section-label mb-1.5">Video Title</label>
                    <input type="text" placeholder="e.g. Official Music Video" className="input-cyber"
                      onChange={e => setMeta({ ...meta, title: e.target.value })} />
                  </div>
                  <div>
                    <label className="block section-label mb-1.5">Description</label>
                    <textarea placeholder="Description..." className="input-cyber h-20 resize-none"
                      onChange={e => setMeta({ ...meta, description: e.target.value })} />
                  </div>
                  <div>
                    <label className="block section-label mb-1.5">Tags</label>
                    <input type="text" placeholder="pop, rock, sad" className="input-cyber"
                      onChange={e => setMeta({ ...meta, tags: e.target.value })} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Submit ── */}
          <button
            disabled={loading}
            className="btn-cyber-primary w-full py-4 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                <span className="font-mono">Analysing</span>
                <span className="font-mono animate-pulse">...</span>
              </>
            ) : (
              <>
                <Cpu className="w-5 h-5" />
                Run Prediction
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* ── Result panel ── */}
        {result && (
          <div
            className="mt-8 bg-slate-800/40 border border-slate-700/50 p-6 reveal relative overflow-hidden"
            style={{ boxShadow: 'inset 0 0 30px rgba(6, 182, 212, 0.03)' }}
          >
            {/* Inner scan line on result */}
            <div className="scanline" />

            {/* Header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700/50">
              <div
                className="bg-emerald-500/15 border border-emerald-500/40 p-2"
                style={{ boxShadow: '0 0 12px rgba(16, 185, 129, 0.2)' }}
              >
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">
                  Analysis Complete
                </h3>
                <p className="text-xs text-slate-600 font-mono line-clamp-1 mt-0.5">{result.title}</p>
              </div>
            </div>

            {/* Key metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Views */}
              <div className="stat-card-cyan">
                <p className="section-label mb-1">Predicted Views</p>
                <p
                  className="text-3xl font-black text-cyan-400 tabular-nums"
                  style={{ textShadow: '0 0 15px rgba(6, 182, 212, 0.5)' }}
                >
                  {animatedViews.toLocaleString()}
                </p>
              </div>

              {/* Audio Key */}
              <div className="stat-card-purple flex flex-col justify-between">
                <p className="section-label mb-2">Musical Key</p>
                {audioKey ? (
                  <>
                    <p
                      className="text-2xl font-black text-violet-300 leading-tight"
                      style={{ textShadow: '0 0 15px rgba(139, 92, 246, 0.5)' }}
                    >
                      {audioKey.split(' ')[0]}
                    </p>
                    <span
                      className="inline-block mt-1 text-xs font-bold uppercase tracking-widest px-2 py-0.5 border self-start font-mono"
                      style={{
                        color: audioKey.includes('Major') ? '#34d399' : '#c084fc',
                        borderColor: audioKey.includes('Major') ? 'rgba(52,211,153,0.35)' : 'rgba(192,132,252,0.35)',
                        background: audioKey.includes('Major') ? 'rgba(52,211,153,0.06)' : 'rgba(192,132,252,0.06)',
                      }}
                    >
                      {audioKey.includes('Major') ? 'Major' : 'Minor'}
                    </span>
                  </>
                ) : (
                  <p className="text-2xl font-black text-slate-600">—</p>
                )}
              </div>
            </div>

            {/* Acoustic toggle */}
            <button
              onClick={() => setShowFeatures(!showFeatures)}
              className="w-full flex items-center justify-center gap-2 section-label hover:text-cyan-400 transition-colors py-3 border-t border-slate-700/50"
            >
              {showFeatures ? 'Hide' : 'View'} Acoustic Analysis
              {showFeatures ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showFeatures && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 reveal">
                {audioFeatures.map((feature) => {
                  const Icon = feature.icon;
                  const val = result.input_features?.[feature.key];

                  return (
                    <div
                      key={feature.key}
                      className="bg-slate-900/60 border border-slate-700/50 hover:border-cyan-500/30 p-3 transition-all group"
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        <Icon className="w-3.5 h-3.5 text-cyan-500 group-hover:text-cyan-400 transition-colors" />
                        <span className="section-label">{feature.label}</span>
                      </div>
                      <p className="text-lg font-black text-slate-100 group-hover:text-cyan-300 transition-colors">
                        {val !== undefined ? (
                          <>
                            {feature.isRound ? Math.round(val) : val.toFixed(feature.isFixed || 0)}
                            {feature.unit && (
                              <span className="text-xs text-slate-600 ml-1">{feature.unit}</span>
                            )}
                          </>
                        ) : 'N/A'}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
