import Button from '../components/Button';
import styles from '../styles/pages.module.css';

export default function HomePage({ onNext }) {
  return (
    <div className={styles.homeContainer}>
      <div className={styles.homeHeader}> 
        <div className={styles.homeLogo}>
          <span>MINIREFILL</span>
          <span>×</span>
          <span>🧴</span>
        </div>
      </div>
      <div className={styles.homeContent}> </div>
      <div className={styles.homeFooter}> 
        <Button onClick={onNext}>리필 시작</Button>
      </div>
    </div>
  )
}
