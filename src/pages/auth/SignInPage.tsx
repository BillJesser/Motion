import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAuth } from "../../context/AuthContext";

interface SignInFormValues {
  email: string;
  password: string;
}

export function SignInPage() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const defaultEmail = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("email") ?? "";
  }, [location.search]);
  const confirmSignupLink = useMemo(() => {
    return defaultEmail ? `/confirm-signup?email=${encodeURIComponent(defaultEmail)}` : "/confirm-signup";
  }, [defaultEmail]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<SignInFormValues>({
    defaultValues: {
      email: defaultEmail,
      password: "",
    },
  });

  useEffect(() => {
    if (defaultEmail) {
      setValue("email", defaultEmail);
    }
  }, [defaultEmail, setValue]);

  const onSubmit = async (values: SignInFormValues) => {
    console.log("[SignIn] submit payload", values);
    setErrorMessage(null);
    try {
      await signIn(values);
      const redirectTo =
        (location.state as { from?: string } | null)?.from && typeof location.state === "object"
          ? (location.state as { from?: string }).from
          : "/";
      navigate(redirectTo, { replace: true });
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to sign in. Please try again.");
      }
    }
  };

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to access Motion."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register("email", { required: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            {...register("password", { required: true })}
          />
        </div>

        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

        <div className="flex justify-between text-sm gap-4 flex-wrap">
          <Link to="/forgot-password" className="text-primary hover:underline">
            Forgot password?
          </Link>
          <Link to={confirmSignupLink} className="text-primary hover:underline">
            Request email verification
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
          onClick={() => console.log("[SignIn] button clicked")}
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
}
