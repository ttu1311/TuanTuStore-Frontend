"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { btnBase, btnPrimary, btnSecondary } from "@/components/ui/buttons";
import { useStore } from "@/context/StoreContext";
import { contactChannels, storeContact } from "@/data/contact";
import {
  MAX_CONTACT_MESSAGE_LENGTH,
  callTimeLabel,
  callTimes,
  contactTopics,
  validateContact,
  type ContactErrors,
  type ContactValues,
} from "@/lib/contact";

const inputClass =
  "w-full rounded-md border bg-white px-4 text-ink transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary-soft";

// Trang /lien-he: các cách liên hệ trực tiếp (gọi, Zalo, email) và form "Yêu cầu gọi lại".
// initialTopic: chủ đề chọn sẵn, từ ?chu-de= (ví dụ trang tra cứu đơn mở sẵn "Hỏi về đơn hàng")
export default function ContactView({ initialTopic }: { initialTopic: string }) {
  const { isReady, currentUser } = useStore();

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-10">
      {/* Trên điện thoại, cách liên hệ trực tiếp đứng trước: bấm là gọi được ngay */}
      <aside aria-labelledby="direct-title" className="rounded-xl bg-surface p-6 lg:order-last">
        <h2 id="direct-title" className="font-display text-2xl font-semibold text-ink">
          Liên hệ trực tiếp
        </h2>
        <p className="mt-1 text-sm text-ink-muted">Cần gấp? Gọi hoặc nhắn cho cửa hàng.</p>
        <ul className="mt-4 space-y-3">
          {contactChannels.map((channel) => (
            <li key={channel.label}>
              <a
                href={channel.href}
                {...(channel.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="flex min-h-14 items-center gap-3 rounded-lg border border-line bg-white px-4 py-2 transition-colors duration-200 hover:border-primary"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <Icon name={channel.icon} size={20} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm text-ink-muted">{channel.label}</span>
                  <span className="block break-all font-semibold text-ink">{channel.value}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex items-start gap-2 text-sm text-ink-muted">
          <Icon name="clock" size={16} className="mt-0.5 text-primary" />
          <span>Giờ làm việc: {storeContact.hours}</span>
        </p>
      </aside>

      {/* key: khi đọc xong người đang đăng nhập thì mở lại form với tên, số điện thoại và email điền sẵn */}
      <ContactForm
        key={isReady ? (currentUser?.id ?? "guest") : "loading"}
        disabled={!isReady}
        initial={{
          name: currentUser?.name ?? "",
          phone: currentUser?.phone ?? "",
          email: currentUser?.email ?? "",
          topic: contactTopics.some((topic) => topic.id === initialTopic) ? initialTopic : contactTopics[0].id,
          callTime: callTimes[0].id,
          message: "",
        }}
      />
    </div>
  );
}

function ContactForm({ initial, disabled }: { initial: ContactValues; disabled: boolean }) {
  const { submitContactRequest } = useStore();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [formError, setFormError] = useState("");
  // Thông tin của yêu cầu vừa gửi (null = đang điền form)
  const [sent, setSent] = useState<{ phone: string; callTime: string } | null>(null);

  function update(field: keyof ContactValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const newErrors = validateContact(values);
    setErrors(newErrors);
    const firstField = Object.keys(newErrors)[0];
    if (firstField) {
      document.getElementById(`contact-${firstField}`)?.focus();
      return;
    }

    const result = submitContactRequest(values);
    if (!result.ok) {
      if (result.field) setErrors({ [result.field]: result.message });
      else setFormError(result.message);
      return;
    }
    setFormError("");
    setSent({ phone: values.phone.trim(), callTime: values.callTime });
  }

  function startOver() {
    setValues({ ...initial, topic: values.topic });
    setErrors({});
    setSent(null);
  }

  if (sent) {
    return (
      <div role="status" className="rounded-xl border border-line bg-white px-6 py-10 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
          <Icon name="check" size={28} />
        </span>
        <h2 className="mt-4 font-display text-2xl font-semibold text-ink">Đã nhận yêu cầu của bạn</h2>
        <p className="mx-auto mt-2 max-w-[32rem] text-ink-muted">
          Cửa hàng sẽ gọi lại số <span className="font-semibold text-ink">{sent.phone}</span>{" "}
          {sent.callTime === callTimes[0].id ? "trong giờ làm việc" : `vào ${callTimeLabel(sent.callTime).toLowerCase()}`}.
        </p>
        <p className="mx-auto mt-4 max-w-[32rem] rounded-lg bg-gold-soft px-4 py-3 text-sm text-gold-ink">
          Đây là bản demo không có máy chủ: yêu cầu chỉ được lưu trên trình duyệt này. Cần gấp, hãy gọi {storeContact.phoneDisplay} hoặc
          nhắn Zalo.
        </p>
        <button type="button" onClick={startOver} className={`${btnBase} ${btnSecondary} mt-6`}>
          Gửi yêu cầu khác
        </button>
      </div>
    );
  }

  const field = (name: keyof ContactValues) => ({
    id: `contact-${name}`,
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `contact-${name}-error` : undefined,
  });
  const errorText = (name: keyof ContactValues) =>
    errors[name] && (
      <p id={`contact-${name}-error`} className="mt-1.5 text-sm text-sale">
        {errors[name]}
      </p>
    );
  const border = (name: keyof ContactValues) => (errors[name] ? "border-sale" : "border-line");

  return (
    <form noValidate onSubmit={handleSubmit} aria-labelledby="callback-title" className="rounded-xl border border-line bg-white p-6">
      <h2 id="callback-title" className="font-display text-2xl font-semibold text-ink">
        Yêu cầu cửa hàng gọi lại
      </h2>
      <p className="mt-1 text-ink-muted">Để lại thông tin, cửa hàng sẽ gọi cho bạn vào giờ bạn chọn.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="mb-1.5 block font-medium text-ink">
            Họ và tên <span className="text-sale">*</span>
          </label>
          <input
            {...field("name")}
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            autoComplete="name"
            maxLength={100}
            className={`${inputClass} h-12 ${border("name")}`}
          />
          {errorText("name")}
        </div>
        <div>
          <label htmlFor="contact-phone" className="mb-1.5 block font-medium text-ink">
            Số điện thoại <span className="text-sale">*</span>
          </label>
          <input
            {...field("phone")}
            type="tel"
            value={values.phone}
            onChange={(event) => update("phone", event.target.value)}
            placeholder="0901234567"
            autoComplete="tel"
            maxLength={20}
            className={`${inputClass} h-12 ${border("phone")}`}
          />
          {errorText("phone")}
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="contact-email" className="mb-1.5 block font-medium text-ink">
          Email <span className="font-normal text-ink-muted">(không bắt buộc)</span>
        </label>
        <input
          {...field("email")}
          type="email"
          value={values.email}
          onChange={(event) => update("email", event.target.value)}
          placeholder="ten@email.com"
          autoComplete="email"
          maxLength={100}
          className={`${inputClass} h-12 ${border("email")}`}
        />
        {errorText("email")}
      </div>

      <fieldset className="mt-5">
        <legend className="mb-2 font-medium text-ink">Bạn cần hỗ trợ về</legend>
        <div className="flex flex-wrap gap-2">
          {contactTopics.map((topic) => (
            <label
              key={topic.id}
              className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-line px-4 text-sm text-ink transition-colors duration-200 hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-primary-soft has-[:checked]:font-semibold has-[:checked]:text-primary has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-primary-soft"
            >
              <input
                type="radio"
                name="contact-topic"
                value={topic.id}
                checked={values.topic === topic.id}
                onChange={() => update("topic", topic.id)}
                className="sr-only"
              />
              {topic.label}
            </label>
          ))}
        </div>
        {errorText("topic")}
      </fieldset>

      <div className="mt-5">
        <label htmlFor="contact-callTime" className="mb-1.5 block font-medium text-ink">
          Thời gian muốn được gọi
        </label>
        <select
          {...field("callTime")}
          value={values.callTime}
          onChange={(event) => update("callTime", event.target.value)}
          className={`${inputClass} h-12 ${border("callTime")}`}
        >
          {callTimes.map((time) => (
            <option key={time.id} value={time.id}>
              {time.label}
            </option>
          ))}
        </select>
        {errorText("callTime")}
      </div>

      <div className="mt-5">
        <label htmlFor="contact-message" className="mb-1.5 block font-medium text-ink">
          Nội dung <span className="font-normal text-ink-muted">(không bắt buộc)</span>
        </label>
        <textarea
          {...field("message")}
          value={values.message}
          onChange={(event) => update("message", event.target.value)}
          rows={4}
          maxLength={MAX_CONTACT_MESSAGE_LENGTH}
          placeholder="Ví dụ: Tôi muốn đặt 20 hộp quà Tết cho công ty, giao trước 20 tháng Chạp."
          className={`${inputClass} resize-y py-3 ${border("message")}`}
        />
        <p className="mt-1 text-right text-xs text-ink-muted">
          {values.message.length}/{MAX_CONTACT_MESSAGE_LENGTH}
        </p>
        {errorText("message")}
      </div>

      {formError && (
        <p role="alert" className="mt-4 text-sm text-sale">
          {formError}
        </p>
      )}

      <button type="submit" disabled={disabled} className={`${btnBase} ${btnPrimary} mt-4 w-full disabled:opacity-60 sm:w-auto`}>
        Gửi yêu cầu
      </button>
      <p className="mt-3 text-sm text-ink-muted">
        Thông tin chỉ dùng để cửa hàng liên hệ lại với bạn.
      </p>
    </form>
  );
}
