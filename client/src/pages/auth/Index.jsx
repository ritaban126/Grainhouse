
// pages/Auth/Login.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { Button, Input } from "../../components/common";


export function Login() {
  const { login } = useAuth();
  const { success, error: toastErr } = useToast();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      success(`Welcome back, ${user.name}!`);
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) { toastErr(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="font-serif text-2xl block text-center mb-10">Grainhouse</Link>
        <h1 className="font-serif text-3xl mb-1">Sign in</h1>
        <p className="font-mono text-xs text-paper/40 mb-8">Welcome back.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Email" id="email" type="email" required
            value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <Input label="Password" id="password" type="password" required
            value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />

          <div className="flex justify-end">
            <Link to="/forgot-password" className="font-mono text-xs text-paper/40 hover:text-paper transition-colors">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" loading={loading} className="w-full mt-1">Sign in</Button>
        </form>

        <p className="font-mono text-xs text-paper/40 text-center mt-8">
          No account?{" "}
          <Link to="/register" className="text-paper hover:text-accent transition-colors">Create one</Link>
        </p>
      </div>
    </div>
  );
}

// pages/Auth/Register.jsx

export function Register() {
  const { register } = useAuth();
  const { success, error: toastErr } = useToast();
  const navigate = useNavigate();
  const [form, setForm]  = useState({ name: "", email: "", password: "" });
  const [done, setDone]   = useState(false);
  const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await register(form.name, form.email, form.password);

    // Axios stores the backend JSON in res.data
    const data = res?.data; 

    if (data?.success) {
      success?.(data.message);
      setDone(true);
    }
  } catch (err) {
    console.error("🔥 Registration error:", err);
    
    // Get the message from the backend error response if available
    const errorMessage = err.response?.data?.message || err.message || "Registration failed";
    
    toastErr(errorMessage);
  } finally {
    setLoading(false);
  }
};

  if (done) return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="font-mono text-xs text-paper/30 tracking-widest uppercase mb-4">Check your inbox</p>
        <h1 className="font-serif text-3xl mb-4">Verify your email</h1>
        <p className="font-mono text-xs text-paper/45 leading-relaxed">
          We sent a verification link to <strong className="text-paper">{form.email}</strong>.
          Click it to activate your account.
        </p>
        <Link to="/login" className="font-mono text-xs text-paper/40 hover:text-paper mt-8 inline-block transition-colors">
          Back to sign in
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="font-serif text-2xl block text-center mb-10">Grainhouse</Link>
        <h1 className="font-serif text-3xl mb-1">Create account</h1>
        <p className="font-mono text-xs text-paper/40 mb-8">10 free images. No card required.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Name" id="name" type="text" required
            value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <Input label="Email" id="email" type="email" required
            value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <Input label="Password" id="password" type="password" required minLength={6}
            value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />

          <Button type="submit" loading={loading} className="w-full mt-1">Create account</Button>
        </form>

        <p className="font-mono text-xs text-paper/40 text-center mt-8">
          Already have an account?{" "}
          <Link to="/login" className="text-paper hover:text-accent transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}


// pages/Auth/VerifyEmail.jsx

import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate as useNav } from "react-router-dom";
import { authAPI } from "../../api/services.js";
import { Spinner } from "../../components/common/index.jsx";

export function VerifyEmail() {
  const [sp]     = useSearchParams();
  const nav      = useNav();
  const called   = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;
    const token = sp.get("token");
    if (!token) { nav("/login"); return; }
    authAPI.verifyEmail(token)
      .then(({ data }) => {
        localStorage.setItem("accessToken", data.accessToken);
        nav("/dashboard");
      })
      .catch(() => nav("/login"));
  }, []);

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="font-mono text-xs text-paper/40 mt-4">Verifying your email…</p>
      </div>
    </div>
  );
}


// pages/Auth/ForgotPassword.jsx

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent]   = useState(false);
  const [loading, setLoading] = useState(false);
  const { error: toastErr }   = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch (err) { toastErr(err.response?.data?.message || "Failed."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="font-serif text-2xl block text-center mb-10">NichePix</Link>
        {sent ? (
          <div className="text-center">
            <h1 className="font-serif text-3xl mb-4">Check your email</h1>
            <p className="font-mono text-xs text-paper/45">Reset link sent to <strong>{email}</strong>.</p>
          </div>
        ) : (
          <>
            <h1 className="font-serif text-3xl mb-1">Forgot password</h1>
            <p className="font-mono text-xs text-paper/40 mb-8">Enter your email and we'll send a reset link.</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input label="Email" id="email" type="email" required
                value={email} onChange={e => setEmail(e.target.value)} />
              <Button type="submit" loading={loading} className="w-full">Send reset link</Button>
            </form>
          </>
        )}
        <Link to="/login" className="font-mono text-xs text-paper/40 hover:text-paper block text-center mt-8 transition-colors">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}


// pages/Auth/ResetPassword.jsx

export function ResetPassword() {
  const [sp]     = useSearchParams();
  const nav      = useNav();
  const { success, error: toastErr } = useToast();
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.resetPassword({ token: sp.get("token"), password });
      success("Password reset! Please log in.");
      nav("/login");
    } catch (err) { toastErr(err.response?.data?.message || "Failed."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="font-serif text-2xl block text-center mb-10">NichePix</Link>
        <h1 className="font-serif text-3xl mb-1">Reset password</h1>
        <p className="font-mono text-xs text-paper/40 mb-8">Choose a new password.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="New password" id="password" type="password" required minLength={6}
            value={password} onChange={e => setPassword(e.target.value)} />
          <Button type="submit" loading={loading} className="w-full">Reset password</Button>
        </form>
      </div>
    </div>
  );
}