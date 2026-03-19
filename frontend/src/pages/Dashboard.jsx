import { useAuth } from '../context/AuthContext';
import PredictionTool from '../components/PredictionTool';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-10">
        <h1 className="text-4xl text-black font-bold mb-4 bg-clip-text">
          AI Popularity Predictor
        </h1>
        <p className="text-lg">
          {user ? (
            <>Logged in as <span className="text-indigo-400 font-medium">{user.email}</span></>
          ) : (
            "Login to track your prediction history."
          )}
        </p>
      </div>

      {/* The prediction tool */}
      <div className="p-1 rounded-2xl">
        <PredictionTool />
      </div>
      
    </div>
  );
}