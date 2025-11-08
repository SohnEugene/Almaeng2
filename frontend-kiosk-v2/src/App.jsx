import { useMemo, useState } from 'react'
import './App.css'

const SCREENS = {
  HOME: 'home',
  REFILL: 'refill',
}

const REFILL_STEPS = ['intro', 'product-selection']

const PRODUCT_LIST = [
  {
    id: 'soap',
    name: '주방세제 시트러스',
    maker: '알맹연구소',
    description: '천연 오렌지 껍질 추출물',
    pricePerGram: 12,
    discount: 15,
    image:
      'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'shampoo',
    name: '저자극 샴푸 포레스트',
    maker: 'MINIREFILL',
    description: '미셀라 거품, 두피 진정',
    pricePerGram: 18,
    discount: 10,
    image:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'bodywash',
    name: '시어버터 바디워시',
    maker: '플리트',
    description: '건조한 피부용 크리미 워시',
    pricePerGram: 22,
    discount: 12,
    image:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
  },
]

function App() {
  const [screen, setScreen] = useState(SCREENS.HOME)

  return (
    <div className="app-shell">
      {screen === SCREENS.HOME ? (
        <HomeScreen onStart={() => setScreen(SCREENS.REFILL)} />
      ) : (
        <RefillExperience
          products={PRODUCT_LIST}
          onBackHome={() => setScreen(SCREENS.HOME)}
        />
      )}
    </div>
  )
}

const HomeScreen = ({ onStart }) => (
  <section className="home-layout">
    <header className="home-top">
      <div className="logo-lockup">
        <span className="logo-word">MINIREFILL</span>
        <span className="logo-divider">×</span>
        <span className="logo-word accent">알맹상점</span>
      </div>
    </header>

    <div className="home-hero">
      <div className="hero-content">
        <p className="eyebrow">미니 리필 스테이션</p>
        <h1>
          오늘도 가볍게,
          <br />
          필요한 만큼만 담아보세요
        </h1>
        <p className="hero-copy">
          갤럭시 탭을 위한 대형 터치 UI와 따뜻한 오렌지 감성으로
          <br />
          리필 경험을 처음부터 끝까지 안내합니다.
        </p>
      </div>
    </div>

    <footer className="home-cta">
      <button type="button" className="cta-button style-two" onClick={onStart}>
        리필 시작
      </button>
    </footer>
  </section>
)

function RefillExperience({ products, onBackHome }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [selectedProductId, setSelectedProductId] = useState(null)

  const currentStep = REFILL_STEPS[stepIndex]
  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) ?? null,
    [products, selectedProductId],
  )

  const resetFlow = () => {
    setStepIndex(0)
    setSelectedProductId(null)
    onBackHome()
  }

  return (
    <section className="refill-view">
      <div className="refill-toolbar">
        <div className="toolbar-logo">
          <span className="toolbar-logo__primary">MINIREFILL</span>
          <span className="toolbar-logo__secondary">리필 스테이션</span>
        </div>
        <button type="button" className="ghost-btn" onClick={resetFlow}>
          홈으로
        </button>
      </div>

      <div className="refill-stage">
        {currentStep === 'intro' ? (
          <IntroStep onNext={() => setStepIndex(1)} />
        ) : (
          <ProductSelectionStep
            products={products}
            selectedId={selectedProductId}
            selectedProduct={selectedProduct}
            onSelect={setSelectedProductId}
          />
        )}
      </div>
    </section>
  )
}

const IntroStep = ({ onNext }) => (
  <div className="intro-step">
    <div className="intro-badge">MINIREFILL × 알맹상점</div>
    <p className="intro-message">
      빈 용기에 원하는 만큼만
      <br />
      내용물을 담아가세요.
      <br />
      플라스틱 쓰레기도 줄이고,
      <br />
      비용도 아낄 수 있답니다!
    </p>
    <button type="button" className="cta-button style-one" onClick={onNext}>
      리필 여정 살펴보기
    </button>
  </div>
)

function ProductSelectionStep({
  products,
  selectedId,
  selectedProduct,
  onSelect,
}) {
  const canSubmit = Boolean(selectedId)

  return (
    <div className="product-step">
      <div className="step-heading">
        <p className="eyebrow">STEP 02</p>
        <h2>어떤 제품을 리필하시겠어요?</h2>
        <p className="supporting">1g당 가격이 표시됩니다</p>
        {selectedProduct && (
          <p className="selection-feedback">
            선택한 상품: <strong>{selectedProduct.name}</strong>
          </p>
        )}
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <button
            type="button"
            key={product.id}
            className={`product-card ${
              selectedId === product.id ? 'is-selected' : ''
            }`}
            onClick={() => onSelect(product.id)}
          >
            <span className="discount-pill">-{product.discount}%</span>
            <figure className="product-media">
              <img
                src={product.image}
                alt={`${product.name} 상품 이미지`}
                loading="lazy"
              />
            </figure>
            <div className="product-meta">
              <p className="maker">{product.maker}</p>
              <p className="name">{product.name}</p>
              <p className="description">{product.description}</p>
              <p className="price">
                ₩{product.pricePerGram.toLocaleString('ko-KR')}
                <span>/ g</span>
              </p>
            </div>
          </button>
        ))}
      </div>

      <button
        type="button"
        className={`cta-button style-two product-submit ${
          canSubmit ? 'is-active' : 'is-disabled'
        }`}
        aria-disabled={!canSubmit}
      >
        상품 선택 완료
      </button>
    </div>
  )
}

export default App
