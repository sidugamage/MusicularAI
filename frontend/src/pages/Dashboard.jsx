import { useAuth } from '../context/AuthContext';
import PredictionTool from '../components/PredictionTool';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          AI Popularity Predictor
        </h1>
        <p className="text-slate-400 text-lg">
          {user ? (
            <>Logged in as <span className="text-indigo-400 font-medium">{user.email}</span></>
          ) : (
            "Login to track your prediction history."
          )}
        </p>
      </div>

      {/* The prediction tool */}
      <div className="bg-slate-800/30 p-1 rounded-2xl">
        <PredictionTool />
      </div>
      
    </div>
  );
}