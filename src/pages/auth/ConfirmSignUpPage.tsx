import { useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAuth } from "../../context/AuthContext";

interface ConfirmSignUpFormValues {
  email: string;
  code: string;
}

export function ConfirmSignUpPage() {
  const { user, confirmSignUp } = useAuth();
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
    formState: { isSubmitting },
  } = useForm<ConfirmSignUpFormValues>({
    defaultValues: {
      email: queryEmail,
      code: "",
    },
  });

  const onSubmit = async (values: ConfirmSignUpFormValues) => {
    setErrorMessage(null);
    try {
      await confirmSignUp(values);
      navigate(`/signin?email=${encodeURIComponent(values.email)}`, { replace: true });
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to verify the account. Please try again.");
      }
    }
  };

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthLayout
      title="Verify your email"
      description="Enter the verification code sent to your inbox."
      footer={
        <>
          Already confirmed?{" "}
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
          <Label htmlFor="code">Verification code</Label>
          <Input
            id="code"
            type="text"
            placeholder="123456"
            inputMode="numeric"
            {...register("code", { required: true, minLength: 4 })}
          />
        </div>

        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Verifying..." : "Confirm account"}
        </Button>
      </form>
    </AuthLayout>
  );
}

