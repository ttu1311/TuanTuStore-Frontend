// One labelled input with its error message. Used by the account forms.
type FieldProps = {
  id: string;
  label: string;
  value: string;
  onChange?: (value: string) => void; // not needed for a read-only field
  error?: string;
  type?: string;
  autoComplete?: string;
  readOnly?: boolean; // shown but cannot be changed (muted background)
};

const fieldStyle =
  "h-12 w-full rounded-lg border px-4 transition-colors duration-200 placeholder:text-[#7A7F7B] focus:outline-none focus:ring-[3px]";
const fieldEditable = "bg-white text-ink";
const fieldReadOnly = "bg-surface text-ink-muted";
const fieldOk = "border-line focus:border-primary focus:ring-primary-soft";
const fieldBad = "border-sale focus:border-sale focus:ring-sale/20";

export default function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
  readOnly = false,
}: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        readOnly={readOnly}
        aria-readonly={readOnly ? true : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${fieldStyle} ${readOnly ? fieldReadOnly : fieldEditable} ${error ? fieldBad : fieldOk}`}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-sale">
          {error}
        </p>
      )}
    </div>
  );
}
