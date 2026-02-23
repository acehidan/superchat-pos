import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  ArrowLeft,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface TokenData {
  token: string;
  pageId: string;
}

export default function FacebookSuccess() {
  const navigate = useNavigate();
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Extract token and pageId from URL hash
    const extractTokenFromUrl = () => {
      try {
        const hash = window.location.hash;
        console.log("Full hash:", hash);
        // console.log(!hash);

        if (!hash) {
          console.log("hash is empty", hash);
          console.log("No authentication data found");
          // setError("No authentication data found");
          // setLoading(false);
          return;
        }

        // Parse hash parameters
        const params = new URLSearchParams(hash.substring(1)); // Remove # and parse
        console.log("Parsed params:", params.toString());

        const token = params.get("token");
        const pageId = params.get("pageId");
        console.log("Extracted token:", token);
        console.log("Extracted pageId:", pageId);

        if (!token) {
          console.log("Token not found in callback URL");
          setError("Token not found in callback URL");
          setLoading(false);
          return;
        }

        // Parse JWT token (for display purposes) - add error handling
        let tokenPayload;
        try {
          const tokenParts = token.split(".");
          console.log("Token parts:", tokenParts);

          if (tokenParts.length !== 3) {
            throw new Error("Invalid JWT format");
          }

          tokenPayload = JSON.parse(atob(tokenParts[1]));
          console.log("Token payload:", tokenPayload);
        } catch (jwtError) {
          console.error("JWT parsing error:", jwtError);
          // Don't fail the whole process if JWT parsing fails
          tokenPayload = null;
        }

        setTokenData({
          token,
          pageId: pageId || "N/A",
        });

        // Store token in localStorage for future API calls
        localStorage.setItem("authToken", token);

        console.log("Token stored in localStorage");

        // Show success message
        toast.success(
          "Facebook authentication successful! Messenger features are now enabled.",
        );

        setLoading(false);

        // Clean URL parameters without page reload
        window.history.replaceState(null, "", window.location.pathname);
      } catch (err) {
        console.error("Error processing Facebook callback:", err);
        setError(
          "Failed to process authentication data: " + (err as Error).message,
        );
        setLoading(false);
      }
    };

    // Prevent multiple executions
    let processed = false;

    if (!processed) {
      processed = true;
      extractTokenFromUrl();
    }

    return () => {
      processed = true;
    };
  }, []);

  const handleContinueToDashboard = () => {
    navigate("/");
  };

  const handleGoToMessenger = () => {
    navigate("/messenger-users");
  };

  const handleBackToLogin = () => {
    navigate("/facebook-login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Processing Authentication
            </h2>
            <p className="text-gray-600">
              Please wait while we process your Facebook authentication...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Authentication Failed
            </h2>
            <p className="text-red-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={handleBackToLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Facebook Authentication Successful!
          </h1>
          <p className="text-gray-600 mb-6">
            Your Facebook account has been successfully connected.
          </p>

          {tokenData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-blue-800 mb-2">
                Connection Details:
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Page ID:</span>
                  <span className="font-mono text-blue-600">
                    {tokenData.pageId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-green-600 font-medium">Connected</span>
                </div>
                <p className="text-xs text-gray-500 break-all">{`${tokenData.token}`}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleGoToMessenger}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Go to Messenger Users
            </button>

            <button
              onClick={handleContinueToDashboard}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition duration-200"
            >
              Continue to Dashboard
            </button>

            <button
              onClick={handleBackToLogin}
              className="w-full text-blue-600 hover:text-blue-700 font-medium py-2 transition duration-200 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-500">
              <p>Token has been stored in localStorage for API calls.</p>
              <p className="mt-1">
                Your account is now ready to use messenger features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
