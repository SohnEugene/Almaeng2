// src/pages/PaymentProcessingPage.jsx
import { useEffect, useState } from "react";
import { useSession } from "../contexts/SessionContext";
import { preparePayment, approvePayment } from "../services/api/payment";
import { getKioskId } from "../services/kioskStorage";
import { getManagerCode } from "../services/managerStorage";
import Button from "../components/Button";
import "../styles/pages.css";
import KioskHeader from "../components/KioskHeader";

export default function PaymentProcessingPage({ onNext, onHome }) {
  const { session } = useSession();
  const [qrCodeBase64, setQrCodeBase64] = useState(null);
  const [txid, setTxid] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 세션 데이터 검증
        if (!session.selectedProduct) {
          throw new Error("선택된 제품이 없습니다.");
        }

        if (!session.paymentMethod) {
          throw new Error("결제 수단이 선택되지 않았습니다.");
        }

        // 키오스크 ID 가져오기
        const kioskId = getKioskId();
        if (!kioskId) {
          throw new Error(
            "키오스크 ID가 없습니다. /manage 페이지에서 키오스크를 먼저 등록해주세요.",
          );
        }

        // 관리자 정보 가져오기
        const managerCode = getManagerCode();
        if (!managerCode) {
          throw new Error(
            "관리자가 설정되지 않았습니다. /manage 페이지에서 관리자를 먼저 설정해주세요.",
          );
        }

        // 결제 준비 데이터 구성
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

        console.log("💳 결제 준비 요청:", paymentData);

        // 결제 준비 및 QR 코드 가져오기
        const response = await preparePayment(paymentData);

        console.log("✅ 결제 준비 응답:", response);

        setTxid(response.txid);
        setQrCodeBase64(response.qr_code_base64);
      } catch (err) {
        console.error("❌ 결제 준비 실패:", err);
        setError(err.message || "결제 준비 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    initializePayment();
  }, [session]);

  const handleApprovePayment = async () => {
    if (!txid) {
      setError("거래번호가 없습니다.");
      return;
    }

    try {
      setIsApproving(true);
      setError(null);

      console.log("💳 결제 승인 요청:", { txid });

      const response = await approvePayment({ txid });

      console.log("✅ 결제 승인 응답:", response);

      // 결제 승인 성공 후 다음 페이지로 이동
      onNext();
    } catch (err) {
      console.error("❌ 결제 승인 실패:", err);
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
              <div className="paymentProcessingText" style={{ color: "red" }}>
                ❌ {error}
              </div>
              <div className="paymentProcessingAction">
                <Button onClick={() => window.location.reload()}>
                  다시 시도
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
