import Button from "../components/Button";
import "../styles/pages.css";
import coverImage from "../assets/images/cover.png";
import logoBlack from "../assets/images/logo_black.png";
import almangLogo from "../assets/images/almang_logo.png";

export default function HomePage({ onNext }) {
  return (
    <div className="home-container">
      <div className="home-header">
        <div className="home-logo">
          <img src={logoBlack} className="logo1" />
          <span>×</span>
          <img src={almangLogo} className="logo2" />
        </div>
      </div>
      <div className="home-content">
        <img src={coverImage} />
      </div>
      <div className="home-footer">
        <Button onClick={onNext}>리필 시작</Button>
      </div>
    </div>
  );
}
