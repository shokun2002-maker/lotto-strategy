"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sliders, Hash, User } from "lucide-react";

interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    key: "home",
    label: "홈",
    href: "/",
    icon: Home,
  },
  {
    key: "strategy",
    label: "전략",
    href: "/strategy",
    icon: Sliders,
  },
  {
    key: "numbers",
    label: "내 번호",
    href: "/numbers",
    icon: Hash,
  },
  {
    key: "my",
    label: "MY",
    href: "/my",
    icon: User,
  },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-slate-200/80 pb-safe">
      <div className="max-w-md mx-auto h-16 px-4 grid grid-cols-4 items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 transition-all group ${
                isActive ? "text-blue-600 font-bold" : "text-slate-400 hover:text-slate-600 font-medium"
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? "bg-blue-50 text-blue-600" : "group-hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
