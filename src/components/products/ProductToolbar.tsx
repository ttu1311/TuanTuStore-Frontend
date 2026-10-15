import Icon from "@/components/ui/Icon";

const sortOptions = [
  { value: "newest", label: "Mới nhất" },
  { value: "price-asc", label: "Giá thấp đến cao" },
  { value: "price-desc", label: "Giá cao đến thấp" },
];

const fieldStyle =
  "h-12 rounded-lg border border-line bg-white text-ink transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary-soft";

type ProductToolbarProps = {
  total: number; // number of products currently shown
  search: string;
  onSearchChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
};

// Search box + result count + sort dropdown. The state lives in ProductListing.
export default function ProductToolbar({ total, search, onSearchChange, sort, onSortChange }: ProductToolbarProps) {
  return (
    <div className="mb-6 space-y-4">
      <div role="search" className="relative">
        <label htmlFor="product-search" className="sr-only">
          Tìm kiếm sản phẩm
        </label>
        <Icon
          name="search"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted"
        />
        <input
          id="product-search"
          type="search"
          placeholder="Tìm đặc sản, ví dụ: chè, ô mai, nước mắm…"
          autoComplete="off"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className={`${fieldStyle} w-full pl-12 pr-4 placeholder:text-[#7A7F7B]`}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-ink-muted">
          Hiển thị <strong className="font-semibold text-ink">{total}</strong> sản phẩm
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
    </div>
  );
}
