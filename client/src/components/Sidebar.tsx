import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, Code2, PieChart, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Users, label: "Clients", href: "/clients" },
  { icon: Code2, label: "Developers", href: "/developers" },
  { icon: PieChart, label: "Reports", href: "/reports" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLocation("/login");
  };

  return (
    <div className="w-64 bg-white border-r border-border min-h-screen flex flex-col fixed left-0 top-0 bottom-0 shadow-sm z-10">
      <div className="p-8 pb-4">
        <h1 className="text-2xl font-black text-primary flex items-center gap-2 tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
            C
          </div>
          ClientFlow
        </h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {items.map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group",
                location === item.href
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  location === item.href
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {item.label}
            </div>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
