interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, subtitle, right }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div>
        {eyebrow && (
          <div className="text-[11px] font-semibold uppercase tracking-widest text-primary/80">{eyebrow}</div>
        )}
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1 max-w-2xl">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
