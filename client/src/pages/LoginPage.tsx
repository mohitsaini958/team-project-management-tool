import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { loginUser } from '../services/auth.service';
import AuthBrandPanel from '../components/auth/AuthBrandPanel';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Client-side check first — cheap, instant feedback before hitting the network
    const nextErrors: typeof errors = {};
    if (!email.includes('@')) nextErrors.email = 'Enter a valid email address';
    if (password.length === 0) nextErrors.password = 'Password is required';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const { user, token } = await loginUser({ email, password });
      login(token, user);
      navigate('/dashboard');
    } catch (err: any) {
      // Server-side errors (wrong password, etc.) surface here — not caught by client validation
      setFormError(err.response?.data?.message || 'Wrong Credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 min-h-screen bg-[#0c0f14] text-[#e8eaef] font-sans">
      <AuthBrandPanel />

      <div className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-[380px]">
          {/* Logo shown only on mobile, where the brand panel is hidden */}
          <div className="flex md:hidden items-center gap-2.5 font-display font-semibold text-[17px] mb-10">
            ProjectFlow
          </div>

          <AuthTabs active="login" />

          <div className="mb-7">
            <h2 className="font-display font-semibold text-2xl tracking-tight mb-2">
              Welcome back
            </h2>
            <p className="text-[13.5px] text-[#8b93a3]">
              Sign in to pick up where your team left off.
            </p>
          </div>

          {formError && (
            <div className="mb-5 text-[13px] text-[#e0625f] bg-[#e0625f]/10 border border-[#e0625f]/30 rounded-lg px-3 py-2.5">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Field
              id="email"
              label="Email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={setEmail}
              error={errors.email}
            />

            <div className="mb-[18px]">
              <label htmlFor="password" className="block text-[13px] font-medium text-[#8b93a3] mb-[7px]">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-[#12161d] border rounded-lg px-3.5 py-2.5 text-sm text-[#e8eaef] placeholder:text-[#565f6f] focus:outline-none focus:ring-[3px] focus:ring-[#4ddac2]/20 focus:border-[#4ddac2] transition-colors ${
                  errors.password ? 'border-[#e0625f]' : 'border-[#242b37]'
                }`}
              />
              {errors.password && (
                <p className="text-xs text-[#e0625f] mt-1.5">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#4ddac2] text-[#0c0f14] font-semibold text-[14.5px] rounded-lg py-3 mt-2 transition-transform hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-[13.5px] text-[#8b93a3] mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#4ddac2] font-semibold">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Shared tab switcher — visually links to /login and /register as real routes,
// not a JS toggle, since these are two distinct pages in the real app
export function AuthTabs({ active }: { active: 'login' | 'register' }) {
  return (
    <div className="flex gap-1 bg-[#12161d] border border-[#242b37] rounded-[9px] p-1 mb-8">
      <Link
        to="/login"
        className={`flex-1 text-center py-2 rounded-md text-[13.5px] font-medium transition-colors ${
          active === 'login' ? 'bg-[#181d26] text-[#e8eaef]' : 'text-[#8b93a3]'
        }`}
      >
        Sign in
      </Link>
      <Link
        to="/register"
        className={`flex-1 text-center py-2 rounded-md text-[13.5px] font-medium transition-colors ${
          active === 'register' ? 'bg-[#181d26] text-[#e8eaef]' : 'text-[#8b93a3]'
        }`}
      >
        Create account
      </Link>
    </div>
  );
}

function Field({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div className="mb-[18px]">
      <label htmlFor={id} className="block text-[13px] font-medium text-[#8b93a3] mb-[7px]">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-[#12161d] border rounded-lg px-3.5 py-2.5 text-sm text-[#e8eaef] placeholder:text-[#565f6f] focus:outline-none focus:ring-[3px] focus:ring-[#4ddac2]/20 focus:border-[#4ddac2] transition-colors ${
          error ? 'border-[#e0625f]' : 'border-[#242b37]'
        }`}
      />
      {error && <p className="text-xs text-[#e0625f] mt-1.5">{error}</p>}
    </div>
  );
}