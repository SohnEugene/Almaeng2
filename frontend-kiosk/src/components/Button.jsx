// src/components/Button.jsx
import styles from "../styles/components.module.css";

export default function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  style = {},
}) {
  const variantClass =
    {
      primary: styles.buttonPrimary,
      outlined: styles.buttonOutlined,
      double: styles.buttonDouble,
      outlinedDouble: styles.buttonOutlinedDouble,
      small: styles.buttonSmall,
    }[variant] || styles.buttonPrimary;

  const classNames = [styles.button, variantClass].join(" ");

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
