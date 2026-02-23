import { useState } from "react";
import { Facebook, Loader } from "lucide-react";
import axios from "./../services/axios";

export default function FacebookLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFacebookLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      // Redirect to Facebook login in same window
      const response = await axios.get(
        "https://overearnest-intentional-rosendo.ngrok-free.dev/api/v1/auth/facebook?format=json",
      );
      const data = response.data;
      console.log(data.data.oauthUrl);
      window.location.href = data.data.oauthUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-center mb-8">
            <Facebook className="w-12 h-12 text-blue-600 fill-current" />
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Sign In
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Use your Facebook account to sign in
          </p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            onClick={handleFacebookLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Facebook className="w-5 h-5" />
                Sign in with Facebook
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
