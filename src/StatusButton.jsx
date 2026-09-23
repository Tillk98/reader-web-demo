import { Check, EyeOff, Plus } from "lucide-react";

const DETAILS = {
  Ignored: { label: "Ignore", icon: EyeOff },
  Create: { label: "Add", icon: Plus },
  New: { label: "New", numeral: "1" },
  Recognized: { label: "Recognized", numeral: "2" },
  Familiar: { label: "Familiar", numeral: "3" },
  Learned: { label: "Learned", numeral: "4" },
  Known: { label: "Known", icon: Check },
};

export const WORD_BAR_STATUSES = ["Ignored", "New", "Recognized", "Familiar", "Learned", "Known"];

export default function StatusButton({
  status,
  state = "default",
  label = false,
  theme = "light",
  flipping = false,
  onClick,
}) {
  const detail = DETAILS[status];
  const Icon = detail.icon;

  const interactive = typeof onClick === "function";
  const Tag = interactive ? "button" : "span";

  return (
    <Tag
      type={interactive ? "button" : undefined}
      className={`status-button${flipping ? " is-flipping" : ""}`}
      data-status={status}
      data-state={state}
      data-label={label ? "true" : "false"}
      data-theme={theme}
      aria-label={detail.label}
      aria-pressed={interactive ? state === "focus" : undefined}
      onClick={onClick}
    >
      {Icon ? <Icon size={16} strokeWidth={1.33} absoluteStrokeWidth aria-hidden="true" /> : null}
      {detail.numeral ? <span>{detail.numeral}</span> : null}
      {label ? <span>{detail.label}</span> : null}
    </Tag>
  );
}
