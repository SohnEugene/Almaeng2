// src/pages/PaymentProcessingPage.jsx
import { useEffect, useState, useRef } from "react";
import Button from "../components/Button";
import KioskHeader from "../components/KioskHeader";
import "../styles/pages.css";
import { useSession } from "../contexts/SessionContext";
import { preparePayment, approvePayment } from "../api/payment";
import { getKioskId } from "../storage/kiosk";
import { getManagerCode } from "../storage/manager";


export default function PaymentProcessingPage({ onNext, onHome }) {
  const { session } = useSession();
  const [qrCodeBase64, setQrCodeBase64] = useState(null);
  const [txid, setTxid] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);

  const initializedRef = useRef(false); // dev 환경에서 transaction 중복 생성 방지

useEffect(() => {
  if (initializedRef.current) return;
  initializedRef.current = true;

  const initializePayment = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // --- 유효성 검사 ---
      if (!session.selectedProduct) {
        throw new Error("선택된 제품이 없습니다.");
      }
      if (!session.paymentMethod) {
        throw new Error("결제 수단이 선택되지 않았습니다.");
      }
      const kioskId = getKioskId();
      if (!kioskId) {
        throw new Error("키오스크 ID가 없습니다.");
      }
      const managerCode = getManagerCode();
      if (!managerCode) {
        throw new Error("관리자가 설정되지 않았습니다.");
      }

      const paymentData = {
        kid: kioskId,
        pid: session.selectedProduct.pid,
        amount_grams: Math.round(session.weight),
        extra_bottle: session.purchaseContainer,
        product_price: session.pricePerGram,
        total_price: session.totalPrice,
        payment_method: session.paymentMethod,
        manager: managerCode,
      };

      const response = await preparePayment(paymentData);
      setTxid(response.txid);
      setQrCodeBase64(response.qr_code_base64);

    } catch (err) {
      setError(err.message || "결제 준비 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  initializePayment();
}, []);


  const handleApprovePayment = async () => {
    if (!txid) {
      setError("거래번호가 없습니다.");
      return;
    }

    try {
      setIsApproving(true);
      setError(null);
      const response = await approvePayment({ txid });
      onNext();
      
    } catch (err) {
      setError(err.message || "결제 승인 중 오류가 발생했습니다.");
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <>
      <div className="kiosk-page">
        <KioskHeader onHome={onHome} />
        <div className="kiosk-content">
          {isLoading && !error && (
            <>
              <div className="kiosk-title">결제 진행 중...</div>
            </>
          )}

          {error && (
            <>
              <div className="kiosk-title">
                {error}
              </div>
              <div className="kiosk-footer">
                <Button onClick={onHome}>
                  시작 화면으로
                </Button>
              </div>
            </>
          )}

          {qrCodeBase64 && !isLoading && !error && (
            <>
              <div className="kiosk-content-header">
                <h1 className="kiosk-title">
                  QR 코드를 스캔하여
                  <br />
                  결제를 완료해주세요
                </h1>
              </div>
              <img
                src={`data:image/png;base64,${qrCodeBase64}`}
                className="qr-image"
              />
            </>
          )}
        </div>
        <div className="kiosk-footer">
          <Button onClick={handleApprovePayment} disabled={isApproving}>
            결제 완료
          </Button>
        </div>
      </div>
    </>
  );
}