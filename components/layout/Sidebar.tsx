import React from "react";
import Link from "next/link";
import { Home, Landmark, BarChart2, Settings, Goal } from "lucide-react";

export const MainNav = ({ className }: { className?: string; }) => {
  return (
    <nav className={className}>
      <Link
        href="/"
        className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
      >
        <Home className="h-4 w-4" />
        Dashboard
      </Link>
      <Link
        href="/transactions"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
      >
        <Landmark className="h-4 w-4" />
        Transactions
      </Link>
      <Link
        href="/goals"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
      >
        <Goal className="h-4 w-4" />
        Goals
      </Link>
      <Link
        href="/reports"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
      >
        <BarChart2 className="h-4 w-4" />
        Reports
      </Link>
      <Link
        href="/settings"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
      >
        <Settings className="h-4 w-4" />
        Settings
      </Link>
    </nav>
  );
};

const Sidebar = () => {
  return (
    <aside className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Landmark className="h-6 w-6" />
            <span>Fundcy</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <MainNav className="grid gap-2 px-4 text-sm font-medium" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
