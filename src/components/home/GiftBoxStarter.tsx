"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import { occasions } from "@/data/occasions";
import { ANY, budgets, type BudgetId } from "@/lib/giftBox";

const steps = [
  { title: "Bạn mua quà cho ai, dịp nào?", short: "Dịp" },
  { title: "Ngân sách cho mỗi món?", short: "Ngân sách" },
] as const;

const optionStyle =
  "flex min-h-[5.5rem] w-full flex-col items-start justify-center gap-1 rounded-xl border bg-white p-4 text-left transition-colors duration-200 hover:border-primary hover:bg-primary-soft";

// "Ghép hộp quà ba miền" ở trang chủ: 2 câu hỏi (dịp, ngân sách) rồi chuyển sang /hop-qua với hộp đã ghép sẵn
// (mỗi miền một món hợp nhất, khách đổi từng ô được). Toàn bộ phần chọn món nằm ở trang Hộp quà.
export default function GiftBoxStarter() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [occasion, setOccasion] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const touched = useRef(false); // chỉ chuyển con trỏ sau khi khách đã bấm, không giật focus khi mới mở trang

  // Sang câu hỏi mới thì đưa con trỏ tới tiêu đề của nó, để người dùng bàn phím và trình đọc màn hình nghe được câu hỏi
  useEffect(() => {
    if (touched.current) headingRef.current?.focus();
  }, [step]);

  function chooseOccasion(id: string) {
    touched.current = true;
    setOccasion(id);
    setStep(1);
  }

  function chooseBudget(budget: BudgetId) {
    const query = new URLSearchParams({ dip: occasion ?? ANY, "ngan-sach": budget });
    router.push(`/hop-qua?${query.toString()}`);
  }

  return (
    <section id="ghep-hop-qua" aria-labelledby="gift-box-title" className="rounded-2xl bg-surface p-5 sm:p-8 lg:p-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="gift-box-title" className="font-display text-3xl/[1.1] font-bold text-ink md:text-4xl/[1.1]">
            Ghép hộp quà ba miền
          </h2>
          <p className="mt-2 max-w-[38rem] text-ink-muted">
            Trả lời 2 câu, mình ghép sẵn mỗi miền một món hợp nhất. Bạn đổi món nào cũng được.
          </p>
        </div>

        {/* Tiến độ: hai chặng, chặng đã xong có dấu ✓ */}
        <ol aria-label="Tiến độ" className="flex items-center gap-2 text-sm">
          {steps.map((item, index) => {
            const done = step > index;
            const current = step === index;
            return (
              <li
                key={item.short}
                aria-current={current ? "step" : undefined}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium ${
                  current ? "bg-primary text-white" : done ? "bg-primary-soft text-primary" : "bg-white text-ink-muted"
                }`}
              >
                {done ? <Icon name="check" size={14} /> : <span aria-hidden="true">{index + 1}</span>}
                <span>{item.short}</span>
              </li>
            );
          })}
        </ol>
      </div>

      <div key={step} className="mt-8 animate-fade-up">
        <h3 ref={headingRef} tabIndex={-1} className="font-display text-2xl font-semibold text-ink outline-none">
          {steps[step].title}
        </h3>

        {step === 0 && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {occasions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => chooseOccasion(item.id)}
                className={`${optionStyle} ${occasion === item.id ? "border-primary bg-primary-soft" : "border-line"}`}
              >
                <span className="font-semibold text-ink">{item.label}</span>
                <span className="text-sm text-ink-muted">{item.description}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => chooseOccasion(ANY)}
              className={`${optionStyle} ${occasion === ANY ? "border-primary bg-primary-soft" : "border-line"}`}
            >
              <span className="font-semibold text-ink">Chưa nghĩ ra</span>
              <span className="text-sm text-ink-muted">Gợi ý giúp mình</span>
            </button>
          </div>
        )}

        {step === 1 && (
          <>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {budgets.map((item) => (
                <button key={item.id} type="button" onClick={() => chooseBudget(item.id)} className={`${optionStyle} border-line`}>
                  <span className="font-semibold text-ink">{item.label}</span>
                  <span className="text-sm text-ink-muted">{item.hint}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                touched.current = true;
                setStep(0);
              }}
              className="mt-5 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              <Icon name="chevron-left" size={16} />
              Quay lại
            </button>
          </>
        )}
      </div>

      <p className="mt-6 text-sm text-ink-muted">
        Muốn tự ghép từ đầu?{" "}
        <Link href="/hop-qua" className="font-semibold text-primary underline underline-offset-4">
          Mở trang Hộp quà
        </Link>
      </p>
    </section>
  );
}
