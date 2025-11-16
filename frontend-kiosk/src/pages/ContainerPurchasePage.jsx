// src/pages/ContainerPurchasePage.jsx
import Button from "../components/Button";
import styles from "../styles/pages.module.css";
import { useSession } from "../contexts/SessionContext";

export default function ContainerPurchasePage({ onYes, onNo, onHome }) {
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

  const handleHomeClick = () => {
    if (onHome) onHome();
  };

  return (
    <div className={styles.containerPurchaseContainer}>
      <div className={styles.containerPurchaseHeader}>
        <button
          type="button"
          className={styles.headerHomeButton}
          onClick={handleHomeClick}
        >
          home
        </button>
      </div>
      <div className={styles.containerPurchaseContent}>
        <img src="bottles.png" alt="" />

        <div className={styles.containerPurchaseText}>
          미니리필 전용 다회용기
          <span className={styles.purchaseTextDetail}> 500원</span>
          <br />
          장바구니에 추가하시겠어요?
        </div>

        <div className={styles.containerPurchaseButtons}>
          <Button variant="double" onClick={handlePurchase}>
            추가하기
          </Button>

          <Button onClick={handleSkip} variant="outlinedDouble">
            건너뛰기
          </Button>
        </div>
      </div>
    </div>
  );
}
