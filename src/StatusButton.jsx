import { Check, EyeOff, Plus } from "lucide-react";

const DETAILS = {
  Ignored: { label: "Ignore", icon: EyeOff },
  Blue: { label: "Blue Words", icon: Plus },
  Create: { label: "Add", icon: Plus },
  New: { label: "New", numeral: "1" },
  Recognized: { label: "Recognized", numeral: "2" },
  Familiar: { label: "Familiar", numeral: "3" },
  Learned: { label: "Learned", numeral: "4" },
  Known: { label: "Known", icon: Check },
};

export const WORD_BAR_STATUSES = ["Ignored", "New", "Recognized", "Familiar", "Learned", "Known"];

export function BlueWordStatus({ onAdd, onKnown, onIgnore, collapsing = null }) {
  const choice = collapsing === "New" ? "New" : collapsing;

  return (
    <span
      className={`blue-status${collapsing ? " is-collapsing" : ""}`}
      data-choice={choice || undefined}
      role="group"
      aria-label="New word"
    >
      <StatusButton
        status={collapsing === "New" ? "New" : "Blue"}
        state="focus"
        onClick={collapsing ? () => {} : onAdd}
      />
      <StatusButton
        status="Ignored"
        state={collapsing === "Ignored" ? "focus" : "default"}
        onClick={collapsing ? () => {} : onIgnore}
      />
      <StatusButton
        status="Known"
        state={collapsing === "Known" ? "focus" : "default"}
        onClick={collapsing ? () => {} : onKnown}
      />
    </span>
  );
}

export default function StatusButton({
  status,
  state = "default",
  label = false,
  text,
  theme = "light",
  flipping = false,
  onClick,
  role,
}) {
  const detail = DETAILS[status];
  const Icon = detail.icon;
  const name = text || detail.label;

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
      aria-label={name}
      aria-pressed={interactive && !role ? state === "focus" : undefined}
      role={role}
      onClick={onClick}
    >
      {Icon ? <Icon size={16} strokeWidth={1.33} absoluteStrokeWidth aria-hidden="true" /> : null}
      {detail.numeral ? <span>{detail.numeral}</span> : null}
      {label ? <span>{name}</span> : null}
    </Tag>
  );
}
