// src/components/KioskHeader.jsx
import { useSession } from "../contexts/SessionContext";
import logoBlack from "../assets/images/logo_black.png";
import almangLogo from "../assets/images/almang_logo.png";

export default function KioskHeader({ onHome, variant = "default" }) {
  const { resetSession } = useSession();

  const handleHomeClick = () => {
    resetSession();
    if (onHome) {
      onHome();
    }
  };

  const buttonClass = variant === "light"
    ? "kiosk-home-button kiosk-home-button-light"
    : "kiosk-home-button";

  const logoClass = variant === "light"
    ? "kiosk-header-logo kiosk-header-logo-light"
    : "kiosk-header-logo";

  return (
    <div className="kiosk-header">
      <div className={logoClass}>
        <img src={logoBlack} className="logo1"/>
        <span>×</span>
        <img src={almangLogo} className="logo2"/>
      </div>
      <button
        type="button"
        className={buttonClass}
        onClick={handleHomeClick}
      >
        처음 화면으로
      </button>
    </div>
  );
}
