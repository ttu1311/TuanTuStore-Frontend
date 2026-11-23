import Icon from "@/components/ui/Icon";

const sortOptions = [
  { value: "newest", label: "Mới nhất" },
  { value: "price-asc", label: "Giá thấp đến cao" },
  { value: "price-desc", label: "Giá cao đến thấp" },
];

const fieldStyle =
  "h-12 rounded-lg border border-line bg-white text-ink transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary-soft";

// Một điều kiện đang áp dụng (từ khóa, miền, tỉnh, khoảng giá), hiện thành chip có nút × để bỏ riêng nó
export type FilterChip = { key: string; label: string; onRemove: () => void };

type ProductToolbarProps = {
  total: number; // số sản phẩm đang hiển thị
  search: string; // từ khóa đang tìm (từ ô tìm kiếm ở header), "" nếu không có
  chips: FilterChip[];
  onClearAll: () => void;
  sort: string;
  onSortChange: (value: string) => void;
};

// Số kết quả + các điều kiện đang áp dụng + danh sách sắp xếp. State nằm ở ProductListing (và trên địa chỉ trang).
// Ô tìm kiếm duy nhất của trang nằm ở header.
export default function ProductToolbar({ total, search, chips, onClearAll, sort, onSortChange }: ProductToolbarProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p role="status" className="text-ink-muted">
          <strong className="font-semibold text-ink">{total}</strong> sản phẩm
          {search && (
            <>
              {" "}
              cho «<strong className="font-semibold text-ink">{search}</strong>»
            </>
          )}
        </p>
        <div className="flex items-center gap-3">
          <label htmlFor="product-sort" className="text-sm font-medium text-ink-muted">
            Sắp xếp
          </label>
          <select
            id="product-sort"
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
            className={`${fieldStyle} cursor-pointer px-4`}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {chips.length > 0 && (
        <ul aria-label="Điều kiện đang áp dụng" className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <li key={chip.key}>
              <button
                type="button"
                onClick={chip.onRemove}
                aria-label={`Bỏ điều kiện: ${chip.label}`}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-line bg-white pl-4 pr-3 text-sm text-ink transition-colors duration-200 hover:border-primary"
              >
                {chip.label}
                <Icon name="x" size={14} className="text-ink-muted" />
              </button>
            </li>
          ))}
          {chips.length >= 2 && (
            <li>
              <button
                type="button"
                onClick={onClearAll}
                className="inline-flex min-h-10 items-center rounded-full px-3 text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                Xóa tất cả
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
