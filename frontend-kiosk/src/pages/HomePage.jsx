import Button from "../components/Button";
import "../styles/pages.css";
import coverImage from "../assets/images/cover.png";
import logoBlack from "../assets/images/logo_black.png";
import almangLogo from "../assets/images/almang_logo.png";

export default function HomePage({ onNext }) {
  return (
    <div className="homeContainer">
      <div className="homeHeader">
        <div className="homeLogo">
          <img src={logoBlack} className="logo1" alt="logo1" />
          <span>×</span>
          <img src={almangLogo} className="logo2" alt="" />
        </div>
      </div>
      <div className="homeContent">
        <img src={coverImage} alt="Cover" />
      </div>
      <div className="homeFooter">
        <Button onClick={onNext}>리필 시작</Button>
      </div>
    </div>
  );
}
