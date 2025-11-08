// src/components/Button.jsx
import styles from '../styles/components.module.css';

export default function Button({ children, onClick, variant = 'primary', disabled = false, style = {} }) {
  // CSS 모듈 클래스 조합
  const classNames = [
    styles.button,
    variant === 'primary' ? styles.buttonPrimary : styles.buttonOutlined,
  ].join(' ');

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
