// src/components/KioskHeader.jsx
import { useSession } from "../contexts/SessionContext";

export default function KioskHeader({ onHome }) {
  const { resetSession } = useSession();

  const handleHomeClick = () => {
    resetSession();
    if (onHome) {
      onHome();
    }
  };

  return (
    <div className="kiosk-header">
      <button
        type="button"
        className="kiosk-home-button"
        onClick={handleHomeClick}
      >
        처음 화면으로
      </button>
    </div>
  );
}
