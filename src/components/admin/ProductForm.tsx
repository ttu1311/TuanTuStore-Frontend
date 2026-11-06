"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { btnBase, btnPrimary, btnSmall } from "@/components/ui/buttons";
import { useStore, type ActionResult } from "@/context/StoreContext";
import {
  IMAGE_PATH_PATTERN,
  emptyProductForm,
  validateProductForm,
  type ProductFormErrors,
  type ProductFormValues,
  type ProductInput,
} from "@/lib/products";
import { brandNames } from "@/lib/brands";
import { regionKeys, regions } from "@/lib/regions";

type ProductFormProps = {
  initialValues?: ProductFormValues; // trống khi thêm, là sản phẩm hiện có khi sửa
  submitLabel: string;
  onSave: (input: ProductInput, replaceRank?: boolean) => ActionResult; // addProduct hoặc updateProduct
  editingId?: string; // id sản phẩm đang sửa: chính nó không tính là trùng thứ hạng
};

const labelStyle = "mb-1.5 block text-sm font-medium text-ink";
const fieldStyle =
  "w-full rounded-lg border bg-white px-3 text-sm text-ink transition-colors duration-200 focus:outline-none focus:ring-[3px]";
const fieldOk = "border-line focus:border-primary focus:ring-primary-soft";
const fieldBad = "border-sale focus:border-sale focus:ring-sale/20";
const hintStyle = "mt-1 text-xs text-ink-muted";

// Thứ tự trường = thứ tự trên trang, nên lỗi đầu tiên tìm thấy cũng là lỗi đầu tiên trên màn hình
const fieldOrder: (keyof ProductFormErrors)[] = [
  "name",
  "price",
  "oldPrice",
  "region",
  "brand",
  "origin",
  "pack",
  "image",
  "shortDescription",
  "description",
  "rank",
];

// Form thêm / sửa sản phẩm (Admin). Sản phẩm được lưu vào localStorage.
export default function ProductForm({ initialValues = emptyProductForm, submitLabel, onSave, editingId }: ProductFormProps) {
  const { products } = useStore();
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>(initialValues);
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [saveError, setSaveError] = useState("");
  // Thứ hạng nhập vào đang do sản phẩm khác giữ: chờ Admin chọn thay thế hay không
  const [rankConflict, setRankConflict] = useState<{ input: ProductInput; holderName: string } | null>(null);
  // Ảnh xem trước đã tải được chưa? Nhớ theo từng đường dẫn, để báo đường dẫn sai trước khi lưu.
  const [imageCheck, setImageCheck] = useState<{ path: string; ok: boolean } | null>(null);

  const imagePath = values.image.trim();
  const showPreview = IMAGE_PATH_PATTERN.test(imagePath);
  const imageFailed = imageCheck?.path === imagePath && !imageCheck.ok;
  // Gợi ý cho ô ảnh: các ảnh mà sản phẩm đang dùng
  const imageSuggestions = Array.from(new Set(products.map((product) => product.image))).sort();

  // Chỉ được chọn thương hiệu có sẵn (danh mục trong src/data/brands.ts, cộng thương hiệu đang có ở sản phẩm), không tự ghi tên mới
  const brandOptions = brandNames(products);

  function setField(field: keyof ProductFormValues, value: string | boolean) {
    setValues({ ...values, [field]: value });
    setSaveError("");
    if (field === "rank") setRankConflict(null);
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaveError("");

    const { errors: newErrors, input } = validateProductForm(values);
    if (!newErrors.image && imageFailed) {
      newErrors.image = "Không tải được ảnh này. Hãy kiểm tra tên tệp trong thư mục public/images.";
    }
    if (!newErrors.brand && !brandOptions.includes(values.brand.trim())) newErrors.brand = "Vui lòng chọn một thương hiệu có sẵn";
    setErrors(newErrors);

    const firstInvalid = fieldOrder.find((field) => newErrors[field]);
    if (firstInvalid || !input) {
      if (firstInvalid) document.getElementById(firstInvalid)?.focus();
      return;
    }

    const holder = input.rank === undefined ? undefined : products.find((p) => p.rank === input.rank && p.id !== editingId);
    if (holder) {
      setRankConflict({ input, holderName: holder.name });
      return;
    }
    save(input, false);
  }

  function save(input: ProductInput, replaceRank: boolean) {
    const result = onSave(input, replaceRank);
    if (result.ok) router.push("/admin/san-pham");
    else setSaveError(result.message);
  }

  function keepOtherRank() {
    setRankConflict(null);
    document.getElementById("rank")?.focus();
  }

  // Props cho một ô nhập chữ/số và thông báo lỗi của nó
  function field(name: keyof ProductFormErrors) {
    return {
      id: name,
      name,
      value: values[name] as string,
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setField(name, event.target.value),
      "aria-invalid": errors[name] ? true : undefined,
      "aria-describedby": errors[name] ? `${name}-error` : undefined,
    };
  }

  function inputClass(name: keyof ProductFormErrors, extra = "h-11") {
    return `${fieldStyle} ${extra} ${errors[name] ? fieldBad : fieldOk}`;
  }

  function error(name: keyof ProductFormErrors) {
    return errors[name] ? (
      <p id={`${name}-error`} className="mt-1 text-xs text-sale">
        {errors[name]}
      </p>
    ) : null;
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-xl border border-line bg-white p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className={labelStyle}>
            Tên sản phẩm
          </label>
          <input type="text" maxLength={100} {...field("name")} className={inputClass("name")} />
          {error("name")}
        </div>

        <div>
          <label htmlFor="price" className={labelStyle}>
            Giá (đồng)
          </label>
          <input type="number" min={1} step={1} {...field("price")} className={inputClass("price")} />
          {error("price")}
        </div>
        <div>
          <label htmlFor="oldPrice" className={labelStyle}>
            Giá cũ (không bắt buộc)
          </label>
          <input type="number" min={1} step={1} {...field("oldPrice")} className={inputClass("oldPrice")} />
          {error("oldPrice")}
        </div>

        <div>
          <label htmlFor="region" className={labelStyle}>
            Vùng miền
          </label>
          <select {...field("region")} className={inputClass("region")}>
            <option value="">Chọn vùng miền</option>
            {regionKeys.map((key) => (
              <option key={key} value={key}>
                {regions[key].label}
              </option>
            ))}
          </select>
          {error("region")}
        </div>
        <div>
          <label htmlFor="brand" className={labelStyle}>
            Thương hiệu
          </label>
          <select {...field("brand")} className={inputClass("brand")}>
            <option value="">Chọn thương hiệu</option>
            {brandOptions.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
          {error("brand")}
        </div>

        <div>
          <label htmlFor="origin" className={labelStyle}>
            Xuất xứ
          </label>
          <input type="text" maxLength={100} {...field("origin")} className={inputClass("origin")} />
          {error("origin")}
        </div>
        <div>
          <label htmlFor="pack" className={labelStyle}>
            Quy cách
          </label>
          <input type="text" maxLength={50} placeholder="Ví dụ: Hộp 300g" {...field("pack")} className={inputClass("pack")} />
          {error("pack")}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="image" className={labelStyle}>
            Đường dẫn ảnh
          </label>
          <div className="flex items-start gap-4">
            <div className="min-w-0 flex-1">
              <input
                type="text"
                placeholder="/images/p-o-mai.jpg"
                list="image-suggestions"
                {...field("image")}
                className={inputClass("image")}
              />
              <datalist id="image-suggestions">
                {imageSuggestions.map((path) => (
                  <option key={path} value={path} />
                ))}
              </datalist>
              <p className={hintStyle}>Ảnh nằm trong thư mục public của dự án, ví dụ /images/p-o-mai.jpg.</p>
              {error("image")}
            </div>
            {/* Xem trước ảnh trực tiếp (không tối ưu hóa, để phát hiện đường dẫn sai ngay lập tức) */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-surface">
              {showPreview && !imageFailed ? (
                <Image
                  key={imagePath}
                  src={imagePath}
                  width={64}
                  height={64}
                  unoptimized
                  loading="eager"
                  alt="Xem trước ảnh sản phẩm"
                  onLoad={() => setImageCheck({ path: imagePath, ok: true })}
                  onError={() => setImageCheck({ path: imagePath, ok: false })}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="px-1 text-center text-[11px] leading-tight text-ink-muted">
                  {imageFailed ? "Không có ảnh" : "Xem trước"}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="shortDescription" className={labelStyle}>
            Mô tả ngắn
          </label>
          <textarea
            rows={2}
            maxLength={300}
            {...field("shortDescription")}
            className={inputClass("shortDescription", "py-2")}
          />
          {error("shortDescription")}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="description" className={labelStyle}>
            Mô tả chi tiết
          </label>
          <textarea rows={6} maxLength={3000} {...field("description")} className={inputClass("description", "py-2")} />
          <p className={hintStyle}>Để một dòng trống giữa các đoạn văn.</p>
          {error("description")}
        </div>

        <div>
          <label htmlFor="rank" className={labelStyle}>
            Thứ hạng bán chạy (không bắt buộc)
          </label>
          <input type="number" min={1} max={99} step={1} placeholder="Ví dụ: 1" {...field("rank")} className={inputClass("rank")} />
          <p className={hintStyle}>Để trống nếu không phải sản phẩm bán chạy. Số 1 hiển thị là &quot;Top 1&quot;.</p>
          {error("rank")}
        </div>
        <div className="flex items-end">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium text-ink">
            <input
              type="checkbox"
              name="isFeatured"
              checked={values.isFeatured}
              onChange={(event) => setField("isFeatured", event.target.checked)}
              className="h-5 w-5 shrink-0 cursor-pointer accent-primary"
            />
            Sản phẩm nổi bật (hiện ở trang chủ)
          </label>
        </div>
      </div>

      {rankConflict && (
        <div role="alertdialog" aria-labelledby="rank-conflict-title" className="mt-5 rounded-lg border border-sale/40 bg-sale/5 p-4">
          <p id="rank-conflict-title" className="text-sm font-semibold text-sale">
            Top {rankConflict.input.rank} đã có sản phẩm
          </p>
          <p className="mt-1 text-sm text-ink">
            &quot;{rankConflict.holderName}&quot; đang là Top {rankConflict.input.rank}. Bạn có muốn thay thế không? Sản phẩm
            đó sẽ không còn thứ hạng.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => save(rankConflict.input, true)}
              className={`${btnBase} ${btnPrimary} ${btnSmall}`}
            >
              Thay thế
            </button>
            <button
              type="button"
              onClick={keepOtherRank}
              className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-ink-muted underline underline-offset-4 hover:text-ink"
            >
              Chọn thứ hạng khác
            </button>
          </div>
        </div>
      )}

      {saveError && (
        <p role="alert" className="mt-5 text-sm text-sale">
          {saveError}
        </p>
      )}
      {Object.values(errors).some(Boolean) && (
        <p role="alert" className="mt-5 text-sm text-sale">
          Vui lòng kiểm tra lại các thông tin được đánh dấu.
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="submit" className={`${btnBase} ${btnPrimary} ${btnSmall}`}>
          {submitLabel}
        </button>
        <Link
          href="/admin/san-pham"
          className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-ink-muted underline underline-offset-4 hover:text-ink"
        >
          Hủy
        </Link>
      </div>
    </form>
  );
}
