/**
 * API 통합 export
 * @example
 * import { getProducts, registerKiosk, preparePayment } from '@/services/api';
 */

export { 
  getProducts, 
  getProductById 
} from "./product.js";

export {
  registerKiosk,
  getKiosk,
  getKioskProducts,
  addProductToKiosk,
  deleteProductFromKiosk
} from "./kiosk.js";

export { 
  preparePayment, 
  approvePayment 
} from "./payment.js";

export { request, BASE_URL } from "./client.js";
