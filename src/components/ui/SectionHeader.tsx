type SectionHeaderProps = {
  id: string; // id của <h2>, dùng cho aria-labelledby
  title: string;
  description?: string;
};

export default function SectionHeader({ id, title, description }: SectionHeaderProps) {
  return (
    <div className="mb-10">
      <h2 id={id} className="font-display text-4xl/[1.1] font-bold text-ink md:text-title/[1.1]">
        {title}
      </h2>
      {description && <p className="mt-3 max-w-[36rem] text-ink-muted">{description}</p>}
    </div>
  );
}
