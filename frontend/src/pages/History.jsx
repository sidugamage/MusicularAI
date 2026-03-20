import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Calendar, Clock, BarChart3, TrendingUp, Music } from 'lucide-react';

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

  if (loading) return <div className="text-center mt-20">Loading history...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <Clock className="w-8 h-8 text-black" /> Prediction History
      </h1>

      {history.length === 0 ? (
        <div className="bg-black p-8 rounded-xl text-center">
          You haven't made any predictions yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {history.map((item) => (
            <div key={item.id} className="p-6 border-4 border-black flex flex-col md:flex-row items-center justify-between hover:border-gray-400 transition-colors
            shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
              
              <div className="flex-1 mb-4 md:mb-0">
                <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {new Date(item.created_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center text-white gap-1 bg-slate-700 px-2 py-0.5 text-xs uppercase">
                    {item.model_used.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-xs font-bold uppercase">Predicted Views</p>
                  <p className="text-2xl font-bold ">{item.predicted_views.toLocaleString()}</p>
                </div>
                
                <div className="text-right">
                  <p className="text-xs font-bold uppercase">Confidence</p>
                  <div className="flex items-center gap-1 justify-end">
                    <TrendingUp className="w-4 h-4 text-gray-500" />
                    <p className="text-xl font-bold text-gray-500">{(item.confidence_score * 100).toFixed(0)}%</p>
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