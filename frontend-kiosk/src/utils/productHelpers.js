import { PRODUCT_METADATA, PRODUCT_CATALOG } from "../constants/products";

function normalizePid(product) {
  const pidCandidate =
    product?.pid ?? product?.id ?? product?.product_id ?? product?.code;
  return pidCandidate != null ? String(pidCandidate) : undefined;
}

export function enrichProductWithMetadata(product = {}) {
  const pid = normalizePid(product);
  const meta = (pid && PRODUCT_METADATA[pid]) || null;

  return {
    ...product,
    pid: pid || product?.pid,
    brand: product?.brand ?? product?.brand_name ?? meta?.brand ?? "알 수 없는 브랜드",
    tagline: product?.tagline ?? product?.detail ?? product?.description ?? meta?.tagline ?? "",
    discountRate:
      product?.discountRate ??
      product?.discount_rate ??
      meta?.discountRate ??
      null,
    image: product?.image ?? product?.image_url ?? meta?.image ?? product?.image,
  };
}

function extractList(products) {
  if (Array.isArray(products)) return products;
  if (products?.data) {
    if (Array.isArray(products.data)) return products.data;
    if (typeof products.data === "object") return Object.values(products.data);
  }
  if (
    typeof products === "object" &&
    products !== null &&
    Object.values(products).some((value) => typeof value === "object")
  ) {
    return Object.values(products).filter(
      (value) => typeof value === "object" && value !== null
    );
  }
  return [];
}

export function mergeWithProductCatalog(products) {
  const list = extractList(products);

  const catalogMap = PRODUCT_CATALOG.reduce((acc, item) => {
    acc[item.pid] = { ...item };
    return acc;
  }, {});

  list.forEach((item) => {
    const enriched = enrichProductWithMetadata(item);
    if (!enriched?.pid) return;
    catalogMap[enriched.pid] = {
      ...catalogMap[enriched.pid],
      ...enriched,
    };
  });

  return Object.values(catalogMap);
}

export function toProductList(products) {
  return extractList(products);
}
