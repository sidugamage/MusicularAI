import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PredictionTool from '../components/PredictionTool';

export default function Dashboard() {
  const { user } = useAuth();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n) => String(n).padStart(2, '0');
  const clock = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8 pt-4">

        {/* ── Status bar ── */}
        <div className="flex items-center gap-3 justify-center mb-5">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-cyan-500/40" />
          <div className="flex items-center gap-2">
            {/* Pulsing live dot */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
            </span>
            <span className="text-xs text-cyan-500/50 font-mono uppercase tracking-[0.2em]">
              AI SYSTEM v2.0
            </span>
            <span className="text-xs font-mono text-slate-600 tabular-nums">{clock}</span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-cyan-500/40" />
        </div>

        {/* ── Title ── */}
        <h1 className="text-5xl font-black mb-3 tracking-tight">
          <span className="text-white">Musicular</span>
          <span className="glitch-ai">AI</span>
        </h1>

        {/* ── Subtitle ── */}
        <p className="text-sm font-mono text-slate-500">
          {user ? (
            <>
              <span className="text-slate-600">SESSION /</span>{' '}
              <span className="text-cyan-400/80">{user.email}</span>
            </>
          ) : (
            <span className="cursor-blink">Predict your music's viral potential</span>
          )}
        </p>

        {/* ── Decorative waveform bars ── */}
        <div className="flex items-end justify-center gap-[3px] mt-6 h-8 opacity-40">
          {[4,6,9,7,5,8,6,10,7,5,9,6,4,7,9,6,5,8,7,4].map((h, i) => (
            <div
              key={i}
              className="wave-bar"
              style={{
                height: `${h * 2.8}px`,
                animationDelay: `${i * 0.07}s`,
                animationDuration: `${1.2 + (i % 4) * 0.15}s`,
              }}
            />
          ))}
        </div>

      </div>

      <PredictionTool />
    </div>
  );
}
