import { useAuth } from '../context/AuthContext';
import PredictionTool from '../components/PredictionTool';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-8 pt-4">
        <h1 className="text-5xl font-black mb-3 tracking-tight">
          <span className="text-black">Musicular</span>
          <span className="text-indigo-500">AI</span>
        </h1>
        <p className="text-base text-gray-500">
          {user ? (
            <>Signed in as <span className="text-indigo-500 font-semibold">{user.email}</span></>
          ) : (
            "Predict your music's viral potential."
          )}
        </p>
      </div>

      <PredictionTool />
    </div>
  );
}
