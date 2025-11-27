// src/components/Button.jsx
import "../styles/components.css";

const VARIANT_CLASSES = {
  primary: "button-primary",
  outlined: "button-outlined",
  small: "button-small",
};

export default function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  style = {},
}) {
  const variantClass = VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`button ${variantClass}`}
      style={style}
    >
      {children}
    </button>
  );
}
