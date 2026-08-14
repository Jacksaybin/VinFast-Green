/**
 * File: BottomNavigation.tsx
 * Purpose: Fixed footer/navigation with clear separation from main content.
 */

import React from "react";
import { Link } from "react-router";

/**
 * Component: BottomNavigation
 * Purpose: Display footer navigation with stronger background and hover effects.
 */
const BottomNavigation: React.FC = () => {
  const links = [
    { to: "/", label: "Trang chủ" },
    { to: "/investment", label: "Đầu tư" },
    { to: "/benefits", label: "Phúc lợi" },
    { to: "/my-account", label: "Của tôi" },
  ];

  return (
    <footer className="w-full border-t border-slate-700 bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-lg font-semibold">Tên Công Ty</div>
          <div className="text-sm text-slate-400">© {new Date().getFullYear()}</div>
        </div>

        <nav aria-label="Footer navigation" className="flex items-center gap-3">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 hover:text-white transition"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
};

export default BottomNavigation;