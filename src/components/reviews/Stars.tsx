const STAR_PATH = "m12 2.5 2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8Z";

function Row({ size, className }: { size: number; className: string }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width={size} height={size} viewBox="0 0 24 24" className={`shrink-0 ${className}`}>
          <path d={STAR_PATH} fill="currentColor" />
        </svg>
      ))}
    </span>
  );
}

// Hàng 5 ngôi sao, tô vàng theo điểm (4,3 điểm -> tô 86% chiều dài hàng sao).
// Chỉ để nhìn: luôn đi kèm chữ như "4,3 trên 5 sao" cho trình đọc màn hình.
// Cách vẽ: một hàng sao xám, phủ lên trên một hàng sao vàng bị cắt theo phần trăm điểm.
export default function Stars({ value, size = 16 }: { value: number; size?: number }) {
  const percent = Math.max(0, Math.min(value / 5, 1)) * 100;
  return (
    <span aria-hidden="true" className="relative inline-flex shrink-0">
      <Row size={size} className="text-line" />
      <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${percent}%` }}>
        <Row size={size} className="text-gold" />
      </span>
    </span>
  );
}
