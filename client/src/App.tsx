import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60, retry: 1 },
  },
});

// Blocks access until a user is loaded. Redirects to /login if there isn't one.
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0c0f14] text-[#8b93a3] text-sm">
        Loading...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// Keeps a logged-in user from seeing /login or /register again.
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

// Temporary placeholder — replace with the real DashboardPage once Phase 3 is built.
// This exists so the redirect after login/register has somewhere valid to land.
function DashboardPlaceholder() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-[#0c0f14] text-[#e8eaef] flex flex-col items-center justify-center gap-4">
      <p className="text-sm text-[#8b93a3]">Signed in as {user?.email}</p>
      <button
        onClick={logout}
        className="text-sm text-[#4ddac2] font-semibold"
      >
        Log out
      </button>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />

            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPlaceholder />
                </ProtectedRoute>
              }
            />

            {/* Catch-all — anything unmatched goes to dashboard,
                which itself redirects to /login if not authenticated */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
    </QueryClientProvider>
  );
}