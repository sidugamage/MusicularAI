import { useState } from 'react';
import { Upload, Youtube, ArrowRight, Loader2, CheckCircle, Activity, Music2, Zap, BarChart3, ChevronDown, ChevronUp, Plus, BrainCircuit } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function PredictionTool() {
  const [activeTab, setActiveTab] = useState('url'); 
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showFeatures, setShowFeatures] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedModel, setSelectedModel] = useState('neural_network');

  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [meta, setMeta] = useState({ 
    subscribers: '', 
    uploads: '', 
    weekday: 'Monday',
    title: '',
    description: '',
    tags: ''
  });

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
          model_type: selectedModel
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
        formData.append('model_type', selectedModel); // Model type
        
        response = await api.post('/predict/file', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      setResult(response.data);
      toast.success("Prediction Complete!");
    } catch (error) {
      console.error(error);
      toast.error("Prediction Failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl mt-8">
      
      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        <button 
          onClick={() => { setActiveTab('url'); setResult(null); }}
          className={`flex-1 py-4 flex items-center justify-center gap-2 transition-colors ${activeTab === 'url' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-700 text-slate-400'}`}
        >
          <Youtube className="w-5 h-5" />
          <span>YouTube Link</span>
        </button>
        <button 
          onClick={() => { setActiveTab('upload'); setResult(null); }}
          className={`flex-1 py-4 flex items-center justify-center gap-2 transition-colors ${activeTab === 'upload' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-700 text-slate-400'}`}
        >
          <Upload className="w-5 h-5" />
          <span>Upload Audio</span>
        </button>
      </div>

      <div className="p-8 text-left">
        <form onSubmit={handlePredict} className="space-y-6">
          
          {/* MODEL DROPDOWN */}
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
            <label className="flex items-center gap-2 text-sm font-medium text-indigo-400 mb-2">
              <BrainCircuit className="w-4 h-4"/> Select AI Architecture
            </label>
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500 hover:border-indigo-400 transition-colors"
              >
                <option value="neural_network">Deep Neural Network (Standard)</option>
                <option value="xgboost">XGBoost (High Accuracy - Recommended)</option>
              </select>
              <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              *XGBoost uses advanced time-decay analysis for better viral prediction.
            </p>
          </div>

          {activeTab === 'url' ? (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Paste YouTube Video Link</label>
              <input 
                type="url" required placeholder="https://youtube.com/watch?v=..." 
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white 
                focus:ring-2 focus:ring-indigo-500 outline-none"
                value={url} onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Upload MP3 File</label>
                <input 
                  type="file" required accept=".mp3,.wav"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 
                  text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 
                  file:text-sm file:font-semibold file:bg-indigo-600 file:text-white 
                  hover:file:bg-indigo-700"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase text-slate-500 mb-1">Subscribers</label>
                  <input type="number" required className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" 
                    onChange={e => setMeta({...meta, subscribers: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs uppercase text-slate-500 mb-1">Total Uploads</label>
                  <input type="number" required className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" 
                    onChange={e => setMeta({...meta, uploads: e.target.value})} />
                </div>
              </div>

              {/* Advanced details toggle */}
              <div className="pt-2">
                <button 
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  {showAdvanced ? <ChevronUp className="w-4 h-4"/> : <Plus className="w-4 h-4"/>}
                  {showAdvanced ? "Hide Details" : "Add Title, Description & Tags"}
                </button>
              </div>

              {showAdvanced && (
                <div className="space-y-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700 animate-slide-down">
                  <div>
                    <label className="block text-xs uppercase text-slate-500 mb-1">Video Title</label>
                    <input type="text" placeholder="e.g. Official Music Video" 
                      className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                      onChange={e => setMeta({...meta, title: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-slate-500 mb-1">Description</label>
                    <textarea placeholder="Description..." 
                      className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white h-20"
                      onChange={e => setMeta({...meta, description: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-slate-500 mb-1">Tags</label>
                    <input type="text" placeholder="pop, rock, sad" 
                      className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                      onChange={e => setMeta({...meta, tags: e.target.value})} />
                  </div>
                </div>
              )}
            </div>
          )}

          <button 
            disabled={loading}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg mt-6"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Run Prediction <ArrowRight /></>}
          </button>
        </form>

        {result && (
          <div className="mt-8 bg-slate-900/50 border border-indigo-500/30 rounded-xl p-6 animate-fade-in">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-green-500/20 p-3 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1">Prediction Success</h3>
                <p className="text-sm text-slate-400 line-clamp-1">{result.title}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Predicted Views</p>
                <p className="text-3xl font-bold text-indigo-400">{result.predicted_views.toLocaleString()}</p>
              </div>
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Confidence</p>
                <p className="text-3xl font-bold text-emerald-400">{(result.confidence_score * 100).toFixed(1)}%</p>
              </div>
            </div>

            <div className="mt-6">
              <button 
                onClick={() => setShowFeatures(!showFeatures)}
                className="w-full flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white transition-colors py-2 border-t border-slate-800"
              >
                {showFeatures ? 'Hide' : 'View'} Acoustic Analysis
                {showFeatures ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showFeatures && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  <div className="bg-slate-800/50 p-3 rounded border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-1 text-slate-400"><Activity className="w-3 h-3" /> <span className="text-xs">Tempo</span></div>
                    <p className="text-lg font-mono text-white">{result.input_features?.Tempo ? Math.round(result.input_features.Tempo) : 'N/A'} <span className="text-xs text-slate-500 ml-1">BPM</span></p>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-1 text-slate-400"><Zap className="w-3 h-3" /> <span className="text-xs">Energy</span></div>
                    <p className="text-lg font-mono text-white">{result.input_features?.RMSE_Mean ? result.input_features.RMSE_Mean.toFixed(3) : 'N/A'}</p>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-1 text-slate-400"><Music2 className="w-3 h-3" /> <span className="text-xs">Pitch</span></div>
                    <p className="text-lg font-mono text-white">{result.input_features?.Spectral_Centroid_Mean ? Math.round(result.input_features.Spectral_Centroid_Mean) : 'N/A'} <span className="text-xs text-slate-500 ml-1">Hz</span></p>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-1 text-slate-400"><BarChart3 className="w-3 h-3" /> <span className="text-xs">Noise</span></div>
                    <p className="text-lg font-mono text-white">{result.input_features?.ZCR_Mean ? result.input_features.ZCR_Mean.toFixed(3) : 'N/A'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}