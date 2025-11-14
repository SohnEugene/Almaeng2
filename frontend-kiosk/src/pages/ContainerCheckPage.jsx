// src/pages/ContainerCheckPage.jsx
import Button from "../components/Button";
import styles from "../styles/pages.module.css";
import { useSession } from "../contexts/SessionContext";

export default function ContainerCheckPage({ onHasContainer, onNoContainer }) {
  const { setHasContainer } = useSession();

  const handleYes = () => {
    // 용기 보유 여부 세션에 저장
    setHasContainer(true);
    onHasContainer();
  };

  const handleNo = () => {
    // 용기 보유하지 않음
    setHasContainer(false);
    onNoContainer();
  };

  return (
    <div className={styles.containerCheckContainer}>
      <div className={styles.containerCheckHeader}>home</div>
      <div className={styles.containerCheckContent}>
        <div className={styles.containerCheckQuestionDetail}>
          리필을 위해서는 빈 용기가 필요해요
        </div>
        <div className={styles.containerCheckQuestion}>
          혹시 재사용할 용기를 가지고 계신가요?
        </div>

        <div className={styles.containerCheckIcon}>🤔</div>

        <div className={styles.containerCheckButtons}>
          <Button variant="double" onClick={handleNo}>
            아니요, 용기가 없어요
          </Button>

          <Button onClick={handleYes} variant="outlinedDouble">
            네, 용기를 가져왔어요
          </Button>
        </div>
      </div>
    </div>
  );
}
