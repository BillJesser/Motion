import { ReactNode } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Zap, Bookmark, Compass, CalendarPlus, CalendarRange } from "lucide-react";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { useAuth } from "../context/AuthContext";

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  {
    to: "/",
    label: "Discover",
    icon: <Compass className="w-4 h-4" />,
  },
  {
    to: "/saved",
    label: "Saved",
    icon: <Bookmark className="w-4 h-4" />,
  },
  {
    to: "/my-events",
    label: "My Events",
    icon: <CalendarRange className="w-4 h-4" />,
  },
  {
    to: "/create-event",
    label: "Create",
    icon: <CalendarPlus className="w-4 h-4" />,
  },
];

export function AppLayout() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-slate-900 text-foreground">
      <header className="border-b border-border/60 bg-card/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="relative">
              <Zap className="w-6 h-6 text-primary" />
              <div className="absolute inset-0 w-6 h-6 text-primary animate-pulse opacity-40" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Motion
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all",
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/30 shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/70 border border-transparent",
                  ].join(" ")
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.email}</p>
              <p className="text-xs text-muted-foreground">Signed in</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        <Outlet />
      </main>

      <footer className="border-t border-border/60 bg-card/70 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-6 text-sm text-muted-foreground flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span>© {new Date().getFullYear()} Motion. Find events that move you.</span>
          <div className="flex items-center gap-2">
            <Separator orientation="vertical" className="h-4 hidden sm:block" />
            <span>Built with AWS & Gemini powered discovery.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

