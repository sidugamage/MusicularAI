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
        formData.append('model_type', selectedModel);

        response = await api.post('/predict/file', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setResult(response.data);
      toast.success("Prediction Complete!");
    } catch (error) {
      console.error(error);
      toast.error("Prediction Failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white border-2 border-black overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mt-8">

      {/* Tabs */}
      <div className="flex border-b-2 border-black">
        <button
          onClick={() => { setActiveTab('url'); setResult(null); }}
          className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-bold transition-colors border-r-2 border-black ${
            activeTab === 'url'
              ? 'bg-black text-white'
              : 'bg-white text-black hover:bg-zinc-100'
          }`}
        >
          <Youtube className="w-4 h-4" />
          YouTube Link
        </button>
        <button
          onClick={() => { setActiveTab('upload'); setResult(null); }}
          className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-bold transition-colors ${
            activeTab === 'upload'
              ? 'bg-black text-white'
              : 'bg-white text-black hover:bg-zinc-100'
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload Audio
        </button>
      </div>

      <div className="p-8">
        <form onSubmit={handlePredict} className="space-y-6">

          {/* MODEL DROPDOWN */}
          <div className="border-2 border-black p-4 bg-zinc-50">
            <label className="flex items-center gap-2 text-sm font-bold mb-3">
              <BrainCircuit className="w-4 h-4 text-indigo-500"/> AI Architecture
            </label>
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full border-2 border-black p-3 appearance-none cursor-pointer outline-none bg-white hover:border-indigo-500 transition-colors font-medium text-sm"
              >
                <option value="neural_network">Deep Neural Network (Standard)</option>
                <option value="xgboost">XGBoost (High Accuracy — Recommended)</option>
              </select>
              <div className="absolute right-3 top-3.5 pointer-events-none">
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              XGBoost uses advanced time-decay analysis for better viral prediction.
            </p>
          </div>

          {activeTab === 'url' ? (
            <div>
              <label className="block text-sm font-bold mb-2">YouTube Video URL</label>
              <input
                type="url" required placeholder="https://youtube.com/watch?v=..."
                className="w-full border-2 border-black p-3 outline-none focus:border-indigo-500 transition-colors text-sm"
                value={url} onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Upload Audio File</label>
                <input
                  type="file" required accept=".mp3,.wav"
                  className="w-full border-2 border-black p-2 text-sm
                  file:mr-4 file:py-2 file:px-4 file:border-0
                  file:text-sm file:font-bold file:bg-black file:text-white
                  hover:file:bg-indigo-500 file:transition-colors file:cursor-pointer"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-bold mb-1">Subscribers</label>
                  <input
                    type="number" required
                    className="w-full border-2 border-black p-2.5 outline-none focus:border-indigo-500 transition-colors text-sm"
                    onChange={e => setMeta({...meta, subscribers: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-bold mb-1">Total Uploads</label>
                  <input
                    type="number" required
                    className="w-full border-2 border-black p-2.5 outline-none focus:border-indigo-500 transition-colors text-sm"
                    onChange={e => setMeta({...meta, uploads: e.target.value})}
                  />
                </div>
              </div>

              {/* Advanced details toggle */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-indigo-500 transition-colors"
                >
                  {showAdvanced ? <ChevronUp className="w-4 h-4"/> : <Plus className="w-4 h-4"/>}
                  {showAdvanced ? "Hide Details" : "Add Title, Description & Tags"}
                </button>
              </div>

              {showAdvanced && (
                <div className="space-y-4 p-4 border-2 border-black bg-zinc-50">
                  <div>
                    <label className="block text-xs uppercase font-bold mb-1">Video Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Official Music Video"
                      className="w-full border-2 border-black p-2.5 text-sm outline-none focus:border-indigo-500 transition-colors"
                      onChange={e => setMeta({...meta, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-bold mb-1">Description</label>
                    <textarea
                      placeholder="Description..."
                      className="w-full border-2 border-black p-2.5 h-20 text-sm outline-none focus:border-indigo-500 transition-colors resize-none"
                      onChange={e => setMeta({...meta, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-bold mb-1">Tags</label>
                    <input
                      type="text"
                      placeholder="pop, rock, sad"
                      className="w-full border-2 border-black p-2.5 text-sm outline-none focus:border-indigo-500 transition-colors"
                      onChange={e => setMeta({...meta, tags: e.target.value})}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full bg-black hover:bg-indigo-500 text-white font-bold py-4 transition-all flex items-center justify-center gap-2 border-2 border-black disabled:opacity-60 mt-2"
          >
            {loading
              ? <><Loader2 className="animate-spin w-5 h-5" /> Analysing...</>
              : <>Run Prediction <ArrowRight className="w-5 h-5" /></>
            }
          </button>
        </form>

        {result && (
          <div className="mt-8 border-2 border-black bg-zinc-50 p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-black">
              <div className="bg-green-500 p-2">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black">Prediction Complete</h3>
                <p className="text-xs text-gray-500 line-clamp-1">{result.title}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-black p-4 border-2 border-black">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-bold">Predicted Views</p>
                <p className="text-3xl font-black text-white">{result.predicted_views.toLocaleString()}</p>
              </div>
              <div className="bg-indigo-500 p-4 border-2 border-black">
                <p className="text-xs text-indigo-100 uppercase tracking-wider mb-1 font-bold">Confidence Score</p>
                <p className="text-3xl font-black text-white">{(result.confidence_score * 100).toFixed(1)}%</p>
              </div>
            </div>

            <button
              onClick={() => setShowFeatures(!showFeatures)}
              className="w-full flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-black transition-colors py-3 border-t-2 border-black"
            >
              {showFeatures ? 'Hide' : 'View'} Acoustic Analysis
              {showFeatures ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showFeatures && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3">
                {audioFeatures.map((feature) => {
                  const Icon = feature.icon;
                  const val = result.input_features?.[feature.key];

                  return (
                    <div key={feature.key} className="p-3 border-2 border-black bg-white">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Icon className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="text-xs font-bold uppercase">{feature.label}</span>
                      </div>
                      <p className="text-lg font-black">
                        {val !== undefined ? (
                          <>
                            {feature.isRound ? Math.round(val) : val.toFixed(feature.isFixed || 0)}
                            {feature.unit && <span className="text-xs text-gray-400 ml-1">{feature.unit}</span>}
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
