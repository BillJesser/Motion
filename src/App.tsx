import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { SignInPage } from "./pages/auth/SignInPage";
import { SignUpPage } from "./pages/auth/SignUpPage";
import { ConfirmSignUpPage } from "./pages/auth/ConfirmSignUpPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";
import { useAuth } from "./context/AuthContext";
import { AppLayout } from "./layouts/AppLayout";
import { DiscoverPage } from "./pages/app/DiscoverPage";
import { SavedEventsPage } from "./pages/app/SavedEventsPage";
import { MyEventsPage } from "./pages/app/MyEventsPage";
import { CreateEventPage } from "./pages/app/CreateEventPage";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-3 text-center">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Loading your session…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/signin"
        replace
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    );
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/confirm-signup" element={<ConfirmSignUpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DiscoverPage />} />
        <Route path="saved" element={<SavedEventsPage />} />
        <Route path="my-events" element={<MyEventsPage />} />
        <Route path="create-event" element={<CreateEventPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
