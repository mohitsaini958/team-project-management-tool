import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { registerUser } from '../services/auth.service';
import AuthBrandPanel from '../components/auth/AuthBrandPanel';
import { AuthTabs } from './LoginPage';

type Errors = { name?: string; email?: string; password?: string };

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mirrors the backend's registerSchema exactly — same three rules,
  // min 8 chars / one uppercase / one number — so the UI never promises
  // something the server will reject.
  const strength = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };
  const score = Object.values(strength).filter(Boolean).length;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const nextErrors: Errors = {};
    if (name.trim().length < 2) nextErrors.name = 'Name must be at least 2 characters';
    if (!email.includes('@')) nextErrors.email = 'Enter a valid email address';
    if (score < 3) nextErrors.password = 'Password must meet all three requirements';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const { user, token } = await registerUser({ name, email, password });
      login(token, user);
      navigate('/dashboard');
    } catch (err: any) {
      // Most common case here: 409 email already in use, from the backend
      setFormError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 min-h-screen bg-[#0c0f14] text-[#e8eaef] font-sans">
      <AuthBrandPanel />

      <div className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-[380px]">
          <div className="flex md:hidden items-center gap-2.5 font-display font-semibold text-[17px] mb-10">
            ProjectFlow
          </div>

          <AuthTabs active="register" />

          <div className="mb-7">
            <h2 className="font-display font-semibold text-2xl tracking-tight mb-2">
              Create your account
            </h2>
            <p className="text-[13.5px] text-[#8b93a3]">
              Free for one workspace — no card required.
            </p>
          </div>

          {formError && (
            <div className="mb-5 text-[13px] text-[#e0625f] bg-[#e0625f]/10 border border-[#e0625f]/30 rounded-lg px-3 py-2.5">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Field
              id="name"
              label="Name"
              type="text"
              placeholder="Mohit Sharma"
              value={name}
              onChange={setName}
              error={errors.name}
            />

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

              <div className="flex gap-1 mt-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-[3px] flex-1 rounded-full transition-colors"
                    style={{
                      background:
                        i < score
                          ? score === 1
                            ? '#e0625f'
                            : score === 2
                            ? '#e0a840'
                            : '#4ddac2'
                          : '#242b37',
                    }}
                  />
                ))}
              </div>
              <p className="text-[11.5px] text-[#565f6f] mt-1.5">
                {password.length === 0
                  ? 'At least 8 characters, one uppercase, one number'
                  : score === 3
                  ? 'Strong password'
                  : score === 2
                  ? 'Getting there'
                  : 'Too weak'}
              </p>
              {errors.password && (
                <p className="text-xs text-[#e0625f] mt-1.5">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#4ddac2] text-[#0c0f14] font-semibold text-[14.5px] rounded-lg py-3 mt-2 transition-transform hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-[13.5px] text-[#8b93a3] mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-[#4ddac2] font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
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