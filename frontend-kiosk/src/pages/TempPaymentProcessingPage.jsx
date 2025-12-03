import { useEffect, useState } from "react";
import { useSession } from "../contexts/SessionContext";
import { preparePayment, approvePayment } from "../api/payment";
import { getKioskId } from "../storage/kiosk";
import { getManagerCode } from "../storage/manager";
import KioskHeader from "../components/KioskHeader";
import loadingGif from "../assets/loading.gif";
import "../styles/pages.css";

export default function TempPaymentProcessingPage({ onNext, onHome }) {
  const { session } = useSession();
  const [error, setError] = useState(null);

  useEffect(() => {
    const processPayment = async () => {
      try {
        console.log("🔄 Starting temporary payment processing...");

        // Get kiosk ID and manager code from storage
        const kioskId = getKioskId();
        const managerCode = getManagerCode();

        if (!kioskId) {
          throw new Error("키오스크 ID가 없습니다.");
        }
        if (!managerCode) {
          throw new Error("관리자가 설정되지 않았습니다.");
        }

        // Step 1: Prepare payment
        const paymentData = {
          kid: kioskId,
          pid: session.selectedProduct?.pid,
          amount_grams: Math.round(session.weight),
          extra_bottle: session.purchaseContainer,
          product_price: session.pricePerGram,
          total_price: session.totalPrice,
          payment_method: "kakaopay",
          manager: managerCode
        };

        console.log("📤 Preparing payment:", paymentData);
        const prepareResponse = await preparePayment(paymentData);
        console.log("✅ Payment prepared:", prepareResponse);

        // Step 2: Approve payment
        const approvalData = {
          txid: prepareResponse.txid
        };

        console.log("📤 Approving payment:", approvalData);
        const approveResponse = await approvePayment(approvalData);
        console.log("✅ Payment approved:", approveResponse);

        // Navigate to completion page
        if (onNext) {
          onNext();
        }
      } catch (err) {
        console.error("❌ Payment processing failed:", err);
        setError(err.message || "결제 처리 중 오류가 발생했습니다.");
      }
    };

    processPayment();
  }, [session, onNext]);

  if (error) {
    return (
      <div className="kiosk-page">
        <KioskHeader onHome={onHome} />
        <div className="kiosk-content">
          <div className="kiosk-title">오류가 발생했습니다</div>
          <div className="kiosk-subtitle" style={{ color: "#e74c3c" }}>
            {error}
          </div>
          <button
            onClick={onHome}
            style={{
              marginTop: "2rem",
              padding: "1rem 2rem",
              fontSize: "1.2rem",
              backgroundColor: "#3498db",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            처음으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="kiosk-page">
      <KioskHeader onHome={onHome} />
      <div className="kiosk-content">
        <div className="kiosk-content-header">
          <h1 className="kiosk-title">잠시만 기다려주세요</h1>
        </div>
        <img
          src={loadingGif}
          alt="로딩 중"
          style={{
            marginTop: "2rem",
            width: "150px",
            height: "150px",
            objectFit: "contain"
          }}
        />
      </div>
    </div>
  );
}
