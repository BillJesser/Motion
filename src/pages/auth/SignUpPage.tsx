import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAuth } from "../../context/AuthContext";

interface SignUpFormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

export function SignUpPage() {
  const { user, signUp } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorReason, setErrorReason] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<SignUpFormValues>({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: SignUpFormValues) => {
    setErrorMessage(null);
    setErrorReason(null);
    if (values.password !== values.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    try {
      await signUp({ email: values.email, password: values.password });
      navigate(`/confirm-signup?email=${encodeURIComponent(values.email)}`, { replace: true });
    } catch (error) {
      if (isApiError(error)) {
        const payloadMessage =
          typeof error.payload?.message === "string" ? error.payload?.message : null;
        const payloadReason =
          typeof error.payload?.reason === "string" ? error.payload?.reason : null;
        setErrorMessage(payloadMessage ?? error.message ?? "Unable to create your account. Please try again.");
        setErrorReason(payloadReason ?? null);
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to create your account. Please try again.");
      }
    }
  };

  if (user) {
    return <Navigate to="/" replace />;
  }

  const passwordValue = watch("password");

  return (
    <AuthLayout
      title="Create your account"
      description="Sign up to start discovering and hosting events."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/signin" className="text-primary hover:underline">
            Sign in
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
            placeholder="Create a password"
            autoComplete="new-password"
            {...register("password", { required: true, minLength: 8 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Repeat your password"
            autoComplete="new-password"
            {...register("confirmPassword", {
              required: true,
              validate: (value) => value === passwordValue,
            })}
          />
        </div>

        {errorMessage && (
          <div className="space-y-1">
            <p className="text-sm text-destructive">{errorMessage}</p>
            {errorReason && <p className="text-xs text-destructive/80">{errorReason}</p>}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Sign up"}
        </Button>
      </form>
    </AuthLayout>
  );
}

function isApiError(
  error: unknown,
): error is Error & { status?: number; payload?: { message?: string; reason?: string } } {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    "payload" in error &&
    typeof (error as { payload?: unknown }).payload === "object"
  );
}
