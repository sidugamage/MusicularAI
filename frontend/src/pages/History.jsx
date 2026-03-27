import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Calendar, Clock, Music2, BarChart3, Cpu } from 'lucide-react';

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
      console.error('Failed to load history', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center mt-24 gap-4">
      {/* Spinning ring */}
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-slate-800" />
        <div
          className="absolute inset-0 rounded-full border-2 border-t-cyan-400 border-r-cyan-400/30 border-b-transparent border-l-transparent animate-spin"
          style={{ boxShadow: '0 0 12px rgba(6,182,212,0.3)' }}
        />
      </div>
      <p className="section-label tracking-[0.25em]">Loading history...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div
            className="bg-cyan-500/10 border border-cyan-500/30 p-2"
            style={{ boxShadow: '0 0 14px rgba(6, 182, 212, 0.14)' }}
          >
            <Clock className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-100">
              Prediction <span className="text-cyan-400">History</span>
            </h1>
            {history.length > 0 && (
              <p className="text-xs font-mono text-slate-600 mt-0.5">
                {history.length} record{history.length !== 1 ? 's' : ''} found
              </p>
            )}
          </div>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-50" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
          </span>
          <span className="text-xs font-mono text-slate-600 uppercase tracking-wider">Live</span>
        </div>
      </div>

      {history.length === 0 ? (
        <div
          className="bg-slate-900/60 border border-slate-700/50 p-14 text-center bracket-corner relative overflow-hidden"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
        >
          <div className="scanline" />
          <BarChart3 className="w-10 h-10 mx-auto mb-4 text-slate-700" />
          <p className="font-bold text-slate-500">No predictions yet.</p>
          <p className="text-sm text-slate-600 mt-1 font-mono">
            Run your first prediction on the Dashboard.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {history.map((item, idx) => (
            <div
              key={item.id}
              className="bg-slate-900/70 border border-slate-700/50 hover:border-cyan-500/30 transition-all overflow-hidden group relative bracket-corner reveal"
              style={{
                boxShadow: '0 2px 16px rgba(0,0,0,0.3)',
                animationDelay: `${idx * 0.06}s`,
              }}
            >
              {/* Hover scan line */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="scanline" />
              </div>

              {/* Left neon accent bar */}
              <div
                className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
              />

              {/* ── Title + meta ── */}
              <div className="p-4 border-b border-slate-700/50 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-base font-black truncate text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {item.title || 'Untitled Prediction'}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap mt-1.5">
                    <span className="flex items-center gap-1 text-xs text-slate-600 font-mono">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/25 px-2 py-0.5 uppercase font-mono tracking-wider">
                      <Cpu className="w-3 h-3" />
                      {item.model_used.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Stats row ── */}
              <div className="grid grid-cols-2 divide-x divide-slate-700/50">
                <div className="p-4">
                  <p className="section-label mb-1">Predicted Views</p>
                  <p className="text-xl font-black text-slate-100 tabular-nums">
                    {item.predicted_views.toLocaleString()}
                  </p>
                </div>
                <div className="p-4">
                  <p className="section-label mb-1">Musical Key</p>
                  {item.input_data?.audio_key ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Music2 className="w-4 h-4 text-violet-400 shrink-0" />
                      <p
                        className="text-xl font-black text-violet-300"
                        style={{ textShadow: '0 0 10px rgba(139, 92, 246, 0.4)' }}
                      >
                        {item.input_data.audio_key.split(' ')[0]}
                      </p>
                      <span
                        className="text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 border font-mono"
                        style={{
                          color: item.input_data.audio_key.includes('Major') ? '#34d399' : '#c084fc',
                          borderColor: item.input_data.audio_key.includes('Major') ? 'rgba(52,211,153,0.35)' : 'rgba(192,132,252,0.35)',
                          background: item.input_data.audio_key.includes('Major') ? 'rgba(52,211,153,0.06)' : 'rgba(192,132,252,0.06)',
                        }}
                      >
                        {item.input_data.audio_key.includes('Major') ? 'Maj' : 'Min'}
                      </span>
                    </div>
                  ) : (
                    <p className="text-xl font-black text-slate-600">—</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
