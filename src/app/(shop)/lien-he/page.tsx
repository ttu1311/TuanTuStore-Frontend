import type { Metadata } from "next";
import ContactView from "@/components/contact/ContactView";
import { PageContainer } from "@/components/layout/PageLayout";

export const metadata: Metadata = {
  title: "Liên hệ — TuanTuStore",
  description: "Gọi điện, nhắn Zalo, gửi email hoặc để lại số điện thoại để TuanTuStore gọi lại cho bạn.",
};

type ContactPageProps = { searchParams: Promise<{ "chu-de"?: string | string[] }> };

// /lien-he?chu-de=don-hang: mở form với chủ đề chọn sẵn (id trong src/lib/contact.ts)
export default async function ContactPage({ searchParams }: ContactPageProps) {
  const topic = (await searchParams)["chu-de"];
  const initialTopic = (Array.isArray(topic) ? topic[0] : topic) ?? "";

  return (
    <PageContainer>
      <div className="mb-10">
        <h1 className="font-display text-3xl/[1.1] font-semibold text-ink md:text-title/[1.1]">Liên hệ</h1>
        <p className="mt-3 max-w-[40rem] text-ink-muted">
          Cần tư vấn chọn quà, hỏi về đơn hàng hay đặt số lượng lớn? Liên hệ trực tiếp, hoặc để lại số điện thoại để cửa hàng gọi lại
          cho bạn.
        </p>
      </div>
      <ContactView key={initialTopic} initialTopic={initialTopic} />
    </PageContainer>
  );
}
