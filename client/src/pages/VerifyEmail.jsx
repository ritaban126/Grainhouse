import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { authAPI } from "../services/authService"; // Adjust path as needed

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get("token");
      if (!token) {
        setStatus("error");
        setMessage("No token provided.");
        return;
      }

      try {
        // This calls your backend: api.get(`/auth/verify-email?token=${token}`)
        const res = await authAPI.verifyEmail(token);
        setStatus("success");
        setMessage(res.data.message || "Email verified successfully!");
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification failed.");
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center text-paper">
      <div className="text-center">
        <h1 className="font-serif text-3xl mb-4">
          {status === "verifying" && "Verifying..."}
          {status === "success" && "Welcome aboard!"}
          {status === "error" && "Verification Failed"}
        </h1>
        <p className="font-mono text-xs text-paper/60 mb-8">{message}</p>
        
        {status !== "verifying" && (
          <Link to="/login" className="px-6 py-2 bg-paper text-ink rounded-full text-sm font-bold">
            Go to Login
          </Link>
        )}
      </div>
    </div>
  );
}