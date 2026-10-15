// Shared button styles. Use them on <a> or <button>:
//   <a href="/san-pham" className={`${btnBase} ${btnPrimary}`}>...</a>
//
// Each string sets DIFFERENT CSS properties, so they never fight each other.
// (In Tailwind, when two classes set the same property, the order inside the CSS file decides
// which one wins, not the order in className. So the border color lives only in the variants.)
export const btnBase =
  "inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-md border-2 px-6 font-semibold leading-none transition-colors duration-200";

export const btnPrimary = "border-transparent bg-primary text-white hover:bg-primary-dark";
export const btnSecondary = "border-primary bg-transparent text-primary hover:bg-primary-soft";
export const btnLight = "border-transparent bg-white text-primary hover:bg-primary-soft";
export const btnGhost =
  "border-transparent bg-transparent text-primary underline decoration-primary/30 decoration-2 underline-offset-[6px] hover:decoration-primary";

// Smaller text: add after the variant
export const btnSmall = "text-sm";
