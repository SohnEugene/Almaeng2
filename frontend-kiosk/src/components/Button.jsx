// src/components/Button.jsx
export default function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  style = {},
}) {
  const variantClass =
    {
      primary: "buttonPrimary",
      outlined: "buttonOutlined",
      double: "buttonDouble",
      outlinedDouble: "buttonOutlinedDouble",
      small: "buttonSmall",
    }[variant] || "buttonPrimary";

  const classNames = ["button", variantClass].join(" ");

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={classNames}
      style={style}
    >
      {children}
    </button>
  );
}
