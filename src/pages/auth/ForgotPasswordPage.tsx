import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAuth } from "../../context/AuthContext";

interface ForgotPasswordFormValues {
  email: string;
}

export function ForgotPasswordPage() {
  const { user, forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await forgotPassword(values);
      setSuccessMessage("If an account exists for this email, a reset code has been sent.");
      navigate(`/reset-password?email=${encodeURIComponent(values.email)}`, {
        replace: true,
      });
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to process your request. Please try again.");
      }
    }
  };

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthLayout
      title="Reset your password"
      description="Enter your email and we’ll send you a reset code."
      footer={
        <>
          Remembered your password?{" "}
          <Link to="/signin" className="text-primary hover:underline">
            Back to sign in
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

        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
        {successMessage && <p className="text-sm text-primary">{successMessage}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending code..." : "Send reset code"}
        </Button>
      </form>
    </AuthLayout>
  );
}

