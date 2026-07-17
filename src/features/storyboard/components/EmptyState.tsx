import React from "react";

interface EmptyStateProps {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 bg-slate-950/40 border border-slate-900/50 rounded-2xl ${className}`}>
      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500/10 to-pink-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-purple-400 animate-pulse" />
      </div>
      <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">{title}</h3>
      <p className="text-[11px] text-slate-400 max-w-sm leading-relaxed mb-4">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};
