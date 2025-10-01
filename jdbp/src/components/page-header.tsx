import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-2">
        <h1 className="bg-gradient-to-r from-indigo-500 via-sky-500 to-teal-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent md:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-sm font-medium text-slate-600 md:text-base">
            {description}
          </p>
        )}
      </div>
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </div>
  );
}