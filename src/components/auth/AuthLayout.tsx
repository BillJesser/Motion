import { ReactNode } from "react";
import { Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

interface AuthLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-background via-background to-slate-900">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Zap className="w-8 h-8 text-primary" />
                <div className="absolute inset-0 w-8 h-8 text-primary animate-pulse opacity-50" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                Motion
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              Discover and host events in your city.
            </p>
          </div>

          <Card className="backdrop-blur-md bg-card/80 shadow-xl">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-2xl">{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-6">{children}</CardContent>
          </Card>

          {footer && <div className="text-center text-sm text-muted-foreground">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

