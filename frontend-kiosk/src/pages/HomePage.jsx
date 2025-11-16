import Button from "../components/Button";
import styles from "../styles/pages.module.css";

export default function HomePage({ onNext }) {
  return (
    <div className={styles.homeContainer}>
      <div className={styles.homeHeader}>
        <div className={styles.homeLogo}>
          <img src="logo_black.png" className={styles.logo1} alt="logo1" />
          <span>×</span>
          <img src="almang_logo.png" className={styles.logo2} alt="" />
        </div>
      </div>
      <div className={styles.homeContent}>
        <img src="ad_image.png" alt="광고 이미지" />
      </div>
      <div className={styles.homeFooter}>
        <Button onClick={onNext}>리필 시작</Button>
      </div>
    </div>
  );
}
