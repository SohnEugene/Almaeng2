// src/pages/ContainerPurchasePage.jsx
import Button from '../components/Button';
import styles from '../styles/pages.module.css';
import { useSession } from '../contexts/SessionContext';

export default function ContainerPurchasePage({ onYes, onNo }) {
  const { setPurchaseContainer } = useSession();

  const handlePurchase = () => {
    // 세션에 용기 구매 정보 저장
    setPurchaseContainer(true);
    onYes();
  };

  const handleSkip = () => {
    // 용기 구매하지 않음
    setPurchaseContainer(false);
    onNo();
  };

  return (
    <div className={styles.containerPurchaseContainer}>
      <div className={styles.containerPurchaseHeader}>home</div>
      <div className={styles.containerPurchaseContent}>
        <div className={styles.containerPurchaseImageContainer}>
          <span role="img" aria-label="container">
            🫙
          </span>
        </div>

        <div className={styles.containerPurchaseText}>
          미니리필 전용 다회용기를 (500원)
          <br />
          장바구니에 추가하시겠어요?
        </div>

        <div className={styles.containerPurchaseButtons}>
          <Button onClick={handlePurchase}>
            추가하기
          </Button>

          <Button onClick={handleSkip} variant="outlined">
            건너뛰기
          </Button>
        </div>
      </div>
    </div>
  );
}
