import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/40 p-6 shadow-xl backdrop-blur-xl md:p-8">
      <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-400/40 via-sky-500/40 to-teal-300/40 blur-3xl" />
      <div className="absolute -bottom-24 -right-16 h-48 w-48 rounded-full bg-gradient-to-tr from-sky-400/30 via-cyan-400/30 to-teal-200/30 blur-3xl" />
      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-sky-600">Jenn's billing studio</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            <span className="bg-gradient-to-r from-indigo-500 via-sky-500 to-teal-400 bg-clip-text text-transparent">
              {title}
            </span>
          </h1>
          {description && (
            <p className="max-w-3xl text-sm leading-relaxed text-slate-600 md:text-base">
              {description}
            </p>
          )}
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
    </div>
  );
}
