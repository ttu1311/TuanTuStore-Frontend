"use client";

import { useState } from "react";
import { actionDanger } from "@/components/admin/tableStyles";
import { useStore } from "@/context/StoreContext";

// "Xóa" button: asks for confirmation, then removes the product from localStorage
export default function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const { deleteProduct } = useStore();
  const [error, setError] = useState("");

  function handleClick() {
    if (!window.confirm(`Xóa sản phẩm "${name}"? Thao tác này không thể hoàn tác.`)) return;
    const result = deleteProduct(id);
    setError(result.ok ? "" : result.message);
  }

  return (
    <div>
      <button type="button" onClick={handleClick} aria-label={`Xóa ${name}`} className={actionDanger}>
        Xóa
      </button>
      {error && (
        <p role="alert" className="mt-1 max-w-[180px] text-xs text-sale">
          {error}
        </p>
      )}
    </div>
  );
}
