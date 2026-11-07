import Icon, { type IconName } from "@/components/ui/Icon";
import type { ProductStory as Story } from "@/types";

// "Câu chuyện sản phẩm" ở trang chi tiết: cách thưởng thức, bảo quản, mùa ngon nhất. Mục nào trống thì không hiện.
export default function ProductStory({ story }: { story?: Story }) {
  const items: { icon: IconName; title: string; text?: string }[] = [
    { icon: "award", title: "Cách thưởng thức", text: story?.enjoy },
    { icon: "shield", title: "Bảo quản", text: story?.storage },
    { icon: "clock", title: "Mùa ngon nhất", text: story?.season },
  ];
  const shown = items.filter((item) => item.text?.trim());
  if (shown.length === 0) return null;

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-ink">Câu chuyện sản phẩm</h2>
      <ul className={`mt-4 grid gap-4 ${shown.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
        {shown.map((item) => (
          <li key={item.title} className="rounded-xl bg-surface p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary">
                <Icon name={item.icon} size={18} />
              </span>
              <h3 className="font-semibold text-ink">{item.title}</h3>
            </div>
            <p className="mt-3 text-ink-muted">{item.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
