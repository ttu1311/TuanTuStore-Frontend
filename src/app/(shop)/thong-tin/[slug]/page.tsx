import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContentSidebar, { PageContainer } from "@/components/layout/PageLayout";
import { findInfoPage, infoPages, type InfoPage } from "@/data/infoPages";

// Các trang hướng dẫn và chính sách: /thong-tin/huong-dan-mua-hang, /thong-tin/chinh-sach-giao-hang, …
// Nội dung nằm ở src/data/infoPages.ts. Mọi trang được tạo sẵn lúc build; slug khác thì trả về trang 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return infoPages.map((page) => ({ slug: page.slug }));
}

type InfoPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: InfoPageProps): Promise<Metadata> {
  const page = findInfoPage((await params).slug);
  return page ? { title: `${page.title} — Đặc sản 3 Miền`, description: page.description } : {};
}

export default async function InfoPageView({ params }: InfoPageProps) {
  const page = findInfoPage((await params).slug);
  if (!page) notFound();

  return (
    <PageContainer>
      <ContentSidebar sidebarLabel="Các trang hỗ trợ và chính sách" sidebar={<InfoNav current={page.slug} />}>
        <article>
          <h1 className="font-display text-3xl/[1.1] font-semibold text-ink md:text-title/[1.1]">{page.title}</h1>
          <p className="mt-3 max-w-[40rem] text-lg text-ink-muted">{page.description}</p>
          <p className="mt-6 rounded-lg bg-gold-soft px-4 py-3 text-sm text-gold-ink">
            Đặc sản 3 Miền là đồ án học tập: nội dung dưới đây là chính sách mẫu, mô tả cách cửa hàng vận hành.
          </p>

          {page.sections?.map((section) => (
            <section key={section.heading} className="mt-10">
              <h2 className="font-display text-2xl font-semibold text-ink">{section.heading}</h2>
              <div className="mt-3 space-y-3 text-ink-muted">
                {section.paragraphs?.map((text) => <p key={text}>{text}</p>)}
                {section.list && (
                  <ul className="list-disc space-y-2 pl-5 marker:text-primary">
                    {section.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
                {section.steps && (
                  <ol className="space-y-3">
                    {section.steps.map((step, index) => (
                      <li key={step} className="flex gap-4">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-white">
                          {index + 1}
                        </span>
                        <span className="pt-1">{step}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </section>
          ))}

          {page.faq && (
            // Mỗi câu hỏi mở/đóng được (thẻ <details> có sẵn của trình duyệt, không cần JavaScript)
            <div className="mt-10 divide-y divide-line rounded-xl border border-line bg-white">
              {page.faq.map((item) => (
                <details key={item.question} className="group px-6">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold text-ink [&::-webkit-details-marker]:hidden">
                    {item.question}
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-xl leading-none text-primary transition-transform duration-200 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="pb-5 text-ink-muted">{item.answer}</p>
                </details>
              ))}
            </div>
          )}
        </article>
      </ContentSidebar>
    </PageContainer>
  );
}

// Sidebar: mọi trang hỗ trợ và chính sách, chia theo nhóm, trang đang mở được tô sáng
function InfoNav({ current }: { current: string }) {
  const groups = Array.from(new Set(infoPages.map((page) => page.group)));
  const linkClass = (page: InfoPage) =>
    `flex min-h-11 items-center rounded-md px-3 transition-colors duration-200 ${
      page.slug === current ? "bg-primary-soft font-semibold text-primary" : "text-ink-muted hover:bg-surface hover:text-ink"
    }`;

  return (
    <nav aria-label="Hỗ trợ và chính sách" className="rounded-xl border border-line bg-white p-5">
      {groups.map((group) => (
        <div key={group} className="mb-5 last:mb-0">
          <h2 className="mb-2 px-3 text-sm font-semibold uppercase tracking-wide text-ink">{group}</h2>
          <ul>
            {infoPages
              .filter((page) => page.group === group)
              .map((page) => (
                <li key={page.slug}>
                  <Link href={`/thong-tin/${page.slug}`} aria-current={page.slug === current ? "page" : undefined} className={linkClass(page)}>
                    {page.title}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      ))}
      <div className="mt-5 border-t border-line pt-5">
        <Link href="/tra-cuu-don-hang" className="flex min-h-11 items-center rounded-md px-3 font-semibold text-primary hover:bg-primary-soft">
          Tra cứu đơn hàng →
        </Link>
        <Link href="/lien-he" className="flex min-h-11 items-center rounded-md px-3 font-semibold text-primary hover:bg-primary-soft">
          Liên hệ cửa hàng →
        </Link>
      </div>
    </nav>
  );
}
