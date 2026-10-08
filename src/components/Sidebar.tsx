"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Film, 
  Clapperboard, 
  BookOpen, 
  Cpu, 
  Activity, 
  Sparkles 
} from "lucide-react";
import ExtensionStatusButton from "./ExtensionStatusButton";
import GlobalSettingsButton from "./GlobalSettingsButton";

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  isSpecial?: boolean;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export default function Sidebar() {
  const pathname = usePathname();

  const menuGroups: MenuGroup[] = [
    {
      title: "Workspace",
      items: [
        {
          name: "Script & Scenes",
          href: "/",
          icon: Film,
        },
        {
          name: "Storyboard Studio",
          href: "/tools/storyboard",
          icon: Clapperboard,
        },
      ],
    },
    {
      title: "World Definition",
      items: [
        {
          name: "World Bible & DNA",
          href: "/world-bible",
          icon: BookOpen,
        },
      ],
    },
    {
      title: "Engine & Tools",
      items: [
        {
          name: "Orchestrator",
          href: "/orchestrator",
          icon: Cpu,
        },
        {
          name: "Jobs Center",
          href: "/jobs",
          icon: Activity,
        },
        {
          name: "Asset X-Ray",
          href: "/tools/xray",
          icon: Sparkles,
          isSpecial: true,
        },
      ],
    },
  ];

  return (
    <aside 
      className="w-[260px] h-screen sticky top-0 z-30 flex flex-col justify-between border-r border-[#1f1f23] select-none text-slate-300 font-sans"
      style={{
        backgroundColor: "hsl(240, 10%, 4%)", // Premium deep HSL black
      }}
    >
      <div className="flex flex-col pt-6 overflow-y-auto custom-scrollbar flex-1">
        {/* Brand Header */}
        <div className="px-6 mb-8 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-bold text-white shadow-md shadow-purple-900/30">
            S
          </div>
          <span className="font-bold text-lg text-white tracking-tight">
            StoryMee<span className="text-purple-500">Asset</span>
          </span>
        </div>

        {/* Menu Navigation */}
        <nav className="px-4 space-y-7">
          {menuGroups.map((group) => (
            <div key={group.title} className="space-y-2">
              <span className="px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase block">
                {group.title}
              </span>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all group ${
                          isActive
                            ? "bg-slate-900/80 text-white shadow-sm border border-slate-800/40"
                            : item.isSpecial
                            ? "text-red-400 hover:text-red-300 hover:bg-red-950/20"
                            : "hover:bg-slate-900/50 hover:text-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon 
                            className={`w-4 h-4 transition-transform duration-200 group-hover:scale-105 ${
                              isActive 
                                ? "text-purple-400" 
                                : item.isSpecial 
                                ? "text-red-500 animate-pulse" 
                                : "text-slate-400 group-hover:text-slate-300"
                            }`} 
                          />
                          <span>{item.name}</span>
                        </div>
                        {item.isSpecial && (
                          <span className="bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                            Live
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Area with Action Buttons */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/40 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1">
            <ExtensionStatusButton />
          </div>
        </div>
        <div>
          <GlobalSettingsButton />
        </div>
      </div>
    </aside>
  );
}
