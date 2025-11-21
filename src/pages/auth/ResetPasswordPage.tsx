import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAuth } from "../../context/AuthContext";

interface ResetPasswordFormValues {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

export function ResetPasswordPage() {
  const { user, confirmForgotPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryEmail = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("email") ?? "";
  }, [location.search]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    defaultValues: {
      email: queryEmail,
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (queryEmail) {
      setValue("email", queryEmail);
    }
  }, [queryEmail, setValue]);

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setErrorMessage(null);
    if (values.newPassword !== values.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      await confirmForgotPassword({
        email: values.email,
        code: values.code,
        newPassword: values.newPassword,
      });
      navigate(`/signin?email=${encodeURIComponent(values.email)}`, { replace: true });
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to reset the password. Please try again.");
      }
    }
  };

  if (user) {
    return <Navigate to="/" replace />;
  }

  const passwordValue = watch("newPassword");

  return (
    <AuthLayout
      title="Set a new password"
      description="Enter the reset code and choose a new password."
      footer={
        <>
          Know your password?{" "}
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

        <div className="space-y-2">
          <Label htmlFor="code">Reset code</Label>
          <Input
            id="code"
            type="text"
            placeholder="654321"
            inputMode="numeric"
            {...register("code", { required: true, minLength: 4 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">New password</Label>
          <Input
            id="newPassword"
            type="password"
            placeholder="Choose a strong password"
            autoComplete="new-password"
            {...register("newPassword", { required: true, minLength: 8 })}
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

        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Updating password..." : "Update password"}
        </Button>
      </form>
    </AuthLayout>
  );
}
