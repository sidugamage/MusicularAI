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

  const audioFeatures = [
    { label: 'Tempo', icon: Activity, key: 'Tempo', unit: 'BPM', isRound: true },
    { label: 'Energy', icon: Zap, key: 'RMSE_Mean', isFixed: 3 },
    { label: 'Pitch', icon: Music2, key: 'Spectral_Centroid_Mean', unit: 'Hz', isRound: true },
    { label: 'Noise', icon: BarChart3, key: 'ZCR_Mean', isFixed: 3 },
  ];

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
      console.log("Prediction Result:", result);
      toast.success("Prediction Complete!");
    } catch (error) {
      console.error(error);
      toast.error("Prediction Failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-grey border-2 border-black overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] mt-8">
      
      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        <button 
          onClick={() => { setActiveTab('url'); setResult(null); }}
          className={`flex-1 py-4 flex items-center justify-center gap-2 transition-colors ${activeTab === 'url' ? 'bg-stone-950 text-white' : 'hover:bg-black-700 text-stone-950'}`}
        >
          <Youtube className="w-5 h-5" />
          <span>YouTube Link</span>
        </button>
        <button 
          onClick={() => { setActiveTab('upload'); setResult(null); }}
          className={`flex-1 py-4 flex items-center justify-center gap-2 transition-colors ${activeTab === 'upload' ? 'bg-stone-950 text-white' : 'hover:bg-black-700 text-stone-950'}`}
        >
          <Upload className="w-5 h-5" />
          <span>Upload Audio</span>
        </button>
      </div>

      <div className="p-8 text-left">
        <form onSubmit={handlePredict} className="space-y-6">
          
          {/* MODEL DROPDOWN */}
          <div className="bg-gray-200 p-4 border border-slate-700">
            <label className="flex items-center text-black gap-2 text-sm font-medium mb-2">
              <BrainCircuit className="w-4 h-4"/> Select AI Architecture
            </label>
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full rounded-none border border-black p-3 appearance-none cursor-pointer outline-none hover:border-stone-400 transition-colors"
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
              <label className="block text-sm font-medium mb-2">Paste YouTube Video Link</label>
              <input 
                type="url" required placeholder="https://youtube.com/watch?v=..." 
                className="w-full border border-black bg-gray-200 p-3 
                focus:ring-2 focus:ring-black outline-none"
                value={url} onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Upload MP3 File</label>
                <input 
                  type="file" required accept=".mp3,.wav"
                  className="w-full border border-black p-2 file:border file:border-black transition-all 
                  file:mr-4 file:py-2 file:px-4 file:border-0 
                  file:text-sm file:font-semibold file:bg-black file:text-white 
                  hover:file:text-black hover:file:bg-white"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-bold mb-1">Subscribers</label>
                  <input type="number" required className="w-full border border-black p-2
                  focus:ring-1 focus:ring-black outline-none" 
                    onChange={e => setMeta({...meta, subscribers: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs uppercase font-bold mb-1">Total Uploads</label>
                  <input type="number" required className="w-full border border-black p-2
                  focus:ring-1 focus:ring-black outline-none" 
                    onChange={e => setMeta({...meta, uploads: e.target.value})} />
                </div>
              </div>

              {/* Advanced details toggle */}
              <div className="pt-2">
                <button 
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm font-bold hover:text-green-500 transition-colors"
                >
                  {showAdvanced ? <ChevronUp className="w-4 h-4"/> : <Plus className="w-4 h-4"/>}
                  {showAdvanced ? "Hide Details" : "Add Title, Description & Tags"}
                </button>
              </div>

              {showAdvanced && (
                <div className="space-y-4 p-4 border border-slate-700 animate-slide-down">
                  <div>
                    <label className="block text-xs uppercase font-bold mb-1">Video Title</label>
                    <input 
                      type="text" 
                      placeholder="eg: Official Music Video" 
                      className="w-full border border-black p-2 bg-gray-200 placeholder:text-[14px] placeholder:uppercase" 
                      onChange={e => setMeta({...meta, title: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-bold mb-1">Description</label>
                    <textarea 
                      placeholder="Description..." 
                      className="w-full border border-black p-2 bg-gray-200 h-20 placeholder:text-[14px]" 
                      onChange={e => setMeta({...meta, description: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-bold mb-1">Tags</label>
                    <input 
                      type="text" 
                      placeholder="pop, rock, sad" 
                      className="w-full border border-black p-2 bg-gray-200 placeholder:text-[14px]" 
                      onChange={e => setMeta({...meta, tags: e.target.value})} 
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <button 
            disabled={loading}
            className="w-full bg-black hover:bg-white hover:text-black text-white font-bold py-4 transition-all flex items-center justify-center gap-2 shadow-lg mt-6
            border border-black"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Run Prediction <ArrowRight /></>}
          </button>
        </form>

        {result && (
          <div className="mt-8 border border-stone-950 p-6 animate-fade-in">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-green-500/20 p-3 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">Prediction Success</h3>
                <p className="text-sm text-slate-400 line-clamp-1">{result.title}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black p-4 border border-slate-700 text-white font-bold">
                <p className="text-xs uppercase tracking-wider mb-1">Predicted Views</p>
                <p className="text-3xl font-bold">{result.predicted_views.toLocaleString()}</p>
              </div>
              <div className="bg-black p-4 border border-slate-700 text-white font-bold">
                <p className="text-xs uppercase tracking-wider mb-1">Confidence</p>
                <p className="text-3xl font-bold">{(result.confidence_score * 100).toFixed(1)}%</p>
              </div>
            </div>

            <div className="mt-6">
              <button 
                onClick={() => setShowFeatures(!showFeatures)}
                className="w-full flex items-center justify-center gap-2 text-sm font-bold hover:text-gray-500 transition-colors py-2 border-t border-slate-800"
              >
                {showFeatures ? 'Hide' : 'View'} Acoustic Analysis
                {showFeatures ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showFeatures && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  {audioFeatures.map((feature) => {
                    const Icon = feature.icon;
                    const val = result.input_features?.[feature.key];
                    
                    return (
                      <div key={feature.key} className="p-3 border border-black">
                        <div className="flex items-center gap-2 mb-1 font-bold">
                          <Icon className="w-3 h-3" /> 
                          <span className="text-xs">{feature.label}</span>
                        </div>
                        <p className="text-lg font-bold">
                          {val !== undefined ? (
                            <>
                              {feature.isRound ? Math.round(val) : val.toFixed(feature.isFixed || 0)}
                              {feature.unit && <span className="text-xs text-slate-500 ml-1">{feature.unit}</span>}
                            </>
                          ) : 'N/A'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}