import { useEffect, useState } from 'react';
import api from '../api/axios'
import { Calendar, Clock, TrendingUp, BarChart3 } from 'lucide-react';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/history/');
      setHistory(res.data);
    } catch (error) {
      console.error("Failed to load history", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center mt-24 gap-3">
      <div className="w-8 h-8 border-4 border-black border-t-indigo-500 rounded-full animate-spin" />
      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Loading history...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-black p-2">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-3xl font-black">Prediction History</h1>
      </div>

      {history.length === 0 ? (
        <div className="bg-white border-2 border-black p-12 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <BarChart3 className="w-10 h-10 mx-auto mb-4 text-gray-300" />
          <p className="font-bold text-gray-500">No predictions yet.</p>
          <p className="text-sm text-gray-400 mt-1">Run your first prediction on the Dashboard.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(99,102,241,1)] transition-shadow overflow-hidden"
            >
              {/* Title + meta */}
              <div className="p-4 border-b-2 border-black">
                <h3 className="text-base font-black truncate mb-1">{item.title || 'Untitled Prediction'}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                  <span className="text-xs font-bold text-white bg-black px-2 py-0.5 uppercase">
                    {item.model_used.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 divide-x-2 divide-black">
                <div className="p-4">
                  <p className="text-xs font-bold uppercase text-gray-400 mb-0.5">Predicted Views</p>
                  <p className="text-xl font-black">{item.predicted_views.toLocaleString()}</p>
                </div>
                <div className="p-4">
                  <p className="text-xs font-bold uppercase text-gray-400 mb-0.5">Confidence</p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-indigo-500" />
                    <p className="text-xl font-black text-indigo-500">{(item.confidence_score * 100).toFixed(0)}%</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}