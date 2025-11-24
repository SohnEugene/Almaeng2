import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  registerKiosk,
  getKioskProducts,
  addProductToKiosk,
  deleteProductFromKiosk,
  getProducts,
} from "../services/api";
import {
  saveKioskInfo,
  getKioskInfo,
  clearKioskInfo,
} from "../services/kioskStorage";
import {
  MANAGERS,
  saveManagerInfo,
  getManagerInfo,
  clearManagerInfo,
} from "../services/managerStorage";
import { useBluetoothContext } from "../contexts/BluetoothContext";
import HomeView from "../components/management/HomeView";
import RegisterView from "../components/management/RegisterView";
import ProductsView from "../components/management/ProductsView";
import ManagerView from "../components/management/ManagerView";
import BluetoothView from "../components/management/BluetoothView";
import "../styles/management.css";

const VIEWS = {
  HOME: "home",
  REGISTER: "register",
  PRODUCTS: "products",
  MANAGER: "manager",
  BLUETOOTH: "bluetooth",
};

export default function ManagementPage() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState(VIEWS.HOME);
  const [formData, setFormData] = useState({ name: "", location: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registeredInfo, setRegisteredInfo] = useState(getKioskInfo());
  const [managerInfo, setManagerInfo] = useState(getManagerInfo());
  const [allProducts, setAllProducts] = useState([]);
  const [kioskProducts, setKioskProducts] = useState([]);

  const {
    weight,
    isConnected,
    isConnecting,
    error: bleError,
    deviceName,
    connect,
    disconnect,
  } = useBluetoothContext();

  useEffect(() => {
    if (currentView === VIEWS.PRODUCTS) {
      loadAllProducts();
      if (registeredInfo?.kid) {
        loadKioskProducts();
      }
    }
  }, [currentView, registeredInfo?.kid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const response = await registerKiosk({
        name: formData.name,
        location: formData.location,
      });
      const kioskInfo = {
        kid: response.kid,
        name: formData.name,
        location: formData.location,
      };
      saveKioskInfo(kioskInfo);
      setRegisteredInfo(kioskInfo);
      setFormData({ name: "", location: "" });
      setCurrentView(VIEWS.HOME);
      alert("키오스크가 성공적으로 등록되었습니다!");
    } catch (err) {
      setError(err.message || "등록에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearInfo = () => {
    if (window.confirm("정말로 키오스크 등록 정보를 삭제하시겠습니까?")) {
      clearKioskInfo();
      setRegisteredInfo(null);
      alert("키오스크 정보가 삭제되었습니다.");
    }
  };

  const handleClearManager = () => {
    if (window.confirm("정말로 관리자 정보를 삭제하시겠습니까?")) {
      clearManagerInfo();
      setManagerInfo(null);
      alert("관리자 정보가 삭제되었습니다.");
    }
  };

  const handleSelectManager = (manager) => {
    saveManagerInfo(manager.code);
    setManagerInfo(manager);
  };

  const loadAllProducts = async () => {
    try {
      const products = await getProducts();
      setAllProducts(products || []);
    } catch (err) {
      console.error("전체 제품 로드 실패:", err);
    }
  };

  const loadKioskProducts = async () => {
    try {
      const response = await getKioskProducts(registeredInfo.kid);
      setKioskProducts(response.products || []);
    } catch (err) {
      console.error("키오스크 제품 로드 실패:", err);
    }
  };

  const handleToggleProduct = async (productId, isCurrentlySelected) => {
    try {
      if (isCurrentlySelected) {
        await deleteProductFromKiosk(registeredInfo.kid, productId);
      } else {
        await addProductToKiosk(registeredInfo.kid, productId);
      }
      await loadKioskProducts();
    } catch (err) {
      console.error("제품 변경 실패:", err);
      alert(err.message || "제품 변경에 실패했습니다.");
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case VIEWS.HOME:
        return (
          <HomeView
            kioskInfo={registeredInfo}
            managerInfo={managerInfo}
            onClearKiosk={handleClearInfo}
            onClearManager={handleClearManager}
            onNavigate={setCurrentView}
            VIEWS={VIEWS}
          />
        );
      case VIEWS.REGISTER:
        return (
          <RegisterView
            kioskInfo={registeredInfo}
            formData={formData}
            isLoading={isLoading}
            error={error}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onClearKiosk={handleClearInfo}
          />
        );
      case VIEWS.PRODUCTS:
        return (
          <ProductsView
            kioskInfo={registeredInfo}
            allProducts={allProducts}
            kioskProducts={kioskProducts}
            onToggleProduct={handleToggleProduct}
            onGoToRegister={() => setCurrentView(VIEWS.REGISTER)}
          />
        );
      case VIEWS.MANAGER:
        return (
          <ManagerView
            managerInfo={managerInfo}
            managers={Object.values(MANAGERS)}
            onClearManager={handleClearManager}
            onSelectManager={handleSelectManager}
            onNavigateHome={() => setCurrentView(VIEWS.HOME)}
          />
        );
      case VIEWS.BLUETOOTH:
        return (
          <BluetoothView
            isConnected={isConnected}
            isConnecting={isConnecting}
            deviceName={deviceName}
            weight={weight}
            error={bleError}
            onConnect={connect}
            onDisconnect={disconnect}
          />
        );
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="management-page">
      <header className="management-header">
        <div className="header-text-group">
          <div className="title-row">
            <h1>키오스크 관리</h1>
          </div>
          <p className="subtitle">설정 및 제품 관리</p>
        </div>
        <button
          type="button"
          className="btn-exit"
          onClick={
            currentView === VIEWS.HOME
              ? () => navigate("/")
              : () => setCurrentView(VIEWS.HOME)
          }
        >
          {currentView === VIEWS.HOME ? "나가기" : "뒤로가기"}
        </button>
      </header>

      <main className="management-content">{renderCurrentView()}</main>
    </div>
  );
}
