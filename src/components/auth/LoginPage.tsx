import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  Database, 
  Activity, 
  Sparkles,
  Info,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { ThemeSelector } from '../common/ThemeSelector';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { signInWithGoogle, signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const supabaseCallbackUrl = 'https://lpfkcjmxwvshgctutsfz.supabase.co/auth/v1/callback';

  const handleGoogleSignIn = async () => {
    setIsConnectingGoogle(true);
    setOauthError(null);
    try {
      const res = await signInWithGoogle();
      if (res?.error) {
        setOauthError(res.error);
      }
    } catch (err: any) {
      setOauthError(err.message || 'Google OAuth failed to initialize');
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    const res = await signInWithEmail(email, password);
    if (!res.success) {
      setErrorMessage(res.error || 'Authentication failed');
    }
    setIsSubmitting(false);
  };

  const handleCopyCallback = () => {
    navigator.clipboard.writeText(supabaseCallbackUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300 relative transition-colors duration-200">
      
      {/* Ambient Blurred Mesh Background Glow Orbs */}
      <div className="ambient-glow-emerald" aria-hidden="true" />
      <div className="ambient-glow-violet" aria-hidden="true" />

      {/* Top Navigation Bar */}
      <header className="w-full backdrop-blur-xl bg-[var(--bg-canvas)]/80 border-b border-[var(--border-hairline)] px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3 select-none">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 via-teal-500/20 to-indigo-500/20 rounded-2xl blur-sm opacity-60 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative h-10 w-10 rounded-2xl bg-[var(--bg-surface)] border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10 ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
              <BrandLogo className="h-full w-full object-cover transform scale-105" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-[var(--text-primary)] to-emerald-600 dark:to-emerald-400 bg-clip-text text-transparent">
                STRATIQ
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-metadata)] font-medium">
              Enterprise Operations OS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-xs font-mono text-[var(--text-muted)]">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Supabase Synchronized</span>
          </div>
          <ThemeSelector />
        </div>
      </header>

      {/* Main Login Canvas */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 z-10">
        <div className="w-full max-w-xl space-y-6">
          
          {/* Main Card */}
          <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-2xl p-6 sm:p-10 space-y-8 backdrop-blur-xl relative overflow-hidden">
            
            {/* Ambient subtle glow inside card */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header / Intro */}
            <div className="text-center space-y-2 relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Supabase OAuth Gateway</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
                Sign in to STRATIQ OS
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
                Autonomous supply chain command, multi-site buffer health, and real-time incident resolution.
              </p>
            </div>

            {/* Real Supabase Google OAuth Action */}
            <div className="space-y-4">
              <button
                type="button"
                disabled={isConnectingGoogle}
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3.5 py-4 px-6 rounded-2xl bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-300 dark:border-neutral-700 shadow-xl shadow-black/5 hover:shadow-emerald-500/10 font-bold text-sm sm:text-base transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5 group disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isConnectingGoogle ? (
                  <div className="h-5 w-5 rounded-full border-2 border-neutral-900 border-t-transparent animate-spin" />
                ) : (
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                )}
                <span>{isConnectingGoogle ? 'Connecting to Google via Supabase...' : 'Continue with Google'}</span>
                <ArrowRight className="h-4 w-4 text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-0.5 transition-all ml-auto" />
              </button>

              {/* OAuth Provider Configuration Notice / Error Banner */}
              {oauthError && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-amber-600 dark:text-amber-400">
                        Supabase Google Provider Notice
                      </h4>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-relaxed">
                        {oauthError}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-amber-500/20 space-y-2 text-[11px]">
                    <p className="font-semibold text-[var(--text-primary)]">
                      To complete Google OAuth in Supabase (Project: <code className="font-mono text-emerald-600 dark:text-emerald-400">lpfkcjmxwvshgctutsfz</code>):
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-[var(--text-muted)]">
                      <li>In your Supabase Dashboard, go to <strong>Authentication &gt; Sign In / Providers &gt; Google</strong>.</li>
                      <li>Toggle Google to <strong>Enabled</strong>.</li>
                      <li>Add your Google Cloud <strong>Client ID</strong> &amp; <strong>Client Secret</strong>.</li>
                      <li>In Google Cloud Console, set Authorized Redirect URI:</li>
                    </ol>
                    
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-black/20 font-mono text-[10px] break-all border border-amber-500/20">
                      <span className="text-emerald-400 flex-1">{supabaseCallbackUrl}</span>
                      <button
                        type="button"
                        onClick={handleCopyCallback}
                        className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        {copiedUrl ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="relative flex items-center justify-center py-2">
                <div className="border-t border-[var(--border-hairline)] w-full"></div>
                <span className="bg-[var(--bg-surface)] px-3 text-[11px] font-mono text-[var(--text-metadata)] uppercase tracking-wider">
                  Role Routing Rules
                </span>
              </div>

              {/* Role Mapping Guide Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* CEO View Explanation */}
                <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-left">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Default Account
                    </span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      CEO
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-[var(--text-metadata)] truncate">krishlahre49@gmail.com</p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1 leading-snug">
                    CEO View • Strategic KPI dashboards, incident command. <strong>Admin Tab is hidden</strong>.
                  </p>
                </div>

                {/* Admin View Explanation */}
                <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-left">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Other Google Accounts
                    </span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-500 dark:text-amber-300">
                      ADMIN
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-[var(--text-metadata)] truncate">Any other email address</p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1 leading-snug">
                    Admin View • Full entity management &amp; Supabase cloud synchronization active.
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Email / SSO Alternative */}
            <div className="pt-2">
              {!showEmailForm ? (
                <button
                  type="button"
                  onClick={() => setShowEmailForm(true)}
                  className="w-full text-center text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors py-1 cursor-pointer font-medium"
                >
                  Or enter email address directly →
                </button>
              ) : (
                <form onSubmit={handleEmailSubmit} className="space-y-3 p-4 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)] animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[var(--text-primary)]">Email Access Gate</span>
                    <button
                      type="button"
                      onClick={() => setShowEmailForm(false)}
                      className="text-[11px] text-[var(--text-muted)] hover:underline cursor-pointer"
                    >
                      Hide
                    </button>
                  </div>

                  {errorMessage && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                      <Info className="h-4 w-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-mono text-[var(--text-metadata)] uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="krishlahre49@gmail.com"
                      className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-xs text-[var(--text-primary)] placeholder-[var(--text-metadata)] focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[var(--text-metadata)] uppercase mb-1">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-xs text-[var(--text-primary)] placeholder-[var(--text-metadata)] focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <span>{isSubmitting ? 'Verifying...' : 'Sign In with Email'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </form>
              )}
            </div>

            {/* Footer Trust Badges */}
            <div className="pt-4 border-t border-[var(--border-hairline)] flex items-center justify-between text-[11px] text-[var(--text-metadata)] font-mono">
              <div className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-emerald-500" />
                <span>SOC2 Compliant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-indigo-500" />
                <span>Supabase ID: lpfkc...</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-amber-500" />
                <span>99.99% SLA</span>
              </div>
            </div>

          </div>

          {/* Direct Supabase Info Callout */}
          <div className="p-4 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)] text-xs text-[var(--text-muted)] flex items-start gap-3">
            <Info className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-[var(--text-primary)]">Supabase Live Connection:</strong> Connected to your Supabase backend (<code className="font-mono text-emerald-600 dark:text-emerald-400">lpfkcjmxwvshgctutsfz.supabase.co</code>). Once Google is enabled under <em>Authentication &gt; Sign In / Providers &gt; Google</em>, clicking <strong>Continue with Google</strong> will launch real Google account authorization.
            </p>
          </div>

        </div>
      </main>

    </div>
  );
};
