import Button from "../components/Button";
import styles from "../styles/pages.module.css";

export default function HomePage({ onNext }) {
  return (
    <div className={styles.homeContainer}>
      <div className={styles.homeHeader}>
        <div className={styles.homeLogo}>
          <span id={styles.logo1}>MINIREFILL</span>
          <span>×</span>
          <span id={styles.logo2}>알맹상점</span>
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
