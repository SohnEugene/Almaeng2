import json
import os
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

import firebase_admin
from firebase_admin import credentials, firestore

from app.exceptions import (
    FirebaseConnectionException,
    FirebaseCredentialsException,
    FirebaseInitializationException,
    KioskAlreadyExistsException,
    KioskException,
    KioskNotFoundException,
    PaymentException,
    PaymentNotFoundException,
    ProductDataCorruptedException,
    ProductException,
    ProductNotFoundException,
)
from app.models import Kiosk, Payment, Product
from app.services.s3 import s3_service

# Korea Standard Time (UTC+9)
KST = timezone(timedelta(hours=9))


class FirebaseService:
    """Firebase service for database operations"""

    def __init__(self):
        self.db = None

    def initialize(self):
        """Initialize Firebase Admin SDK"""
        try:
            # Check if already initialized
            if not firebase_admin._apps:
                # Try to get credentials from file path first
                cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
                if cred_path:
                    print("use credentials path")
                    try:
                        cred = credentials.Certificate(cred_path)
                        firebase_admin.initialize_app(cred)
                    except FileNotFoundError as e:
                        raise FirebaseCredentialsException(
                            f"Credentials file not found: {cred_path}"
                        ) from e
                    except json.JSONDecodeError as e:
                        raise FirebaseCredentialsException(
                            f"Invalid credentials file format: {cred_path}"
                        ) from e
                else:
                    # Fall back to credentials JSON string
                    print("use credentials json")
                    firebase_json = os.environ.get("FIREBASE_CREDENTIALS_JSON")
                    if firebase_json:
                        try:
                            cred = credentials.Certificate(json.loads(firebase_json))
                            firebase_admin.initialize_app(cred)
                        except json.JSONDecodeError as e:
                            raise FirebaseCredentialsException(
                                "Invalid credentials JSON format"
                            ) from e
                    else:
                        cred_json = os.getenv("FIREBASE_CREDENTIALS_JSON")
                        if cred_json:
                            try:
                                cred_dict = json.loads(cred_json)
                                cred = credentials.Certificate(cred_dict)
                                firebase_admin.initialize_app(cred)
                            except json.JSONDecodeError as e:
                                raise FirebaseCredentialsException(
                                    "Invalid credentials JSON format"
                                ) from e
                        else:
                            raise FirebaseCredentialsException(
                                "Firebase credentials not found. Set FIREBASE_CREDENTIALS_PATH or FIREBASE_CREDENTIALS_JSON"
                            )

                try:
                    self.db = firestore.client()
                    print("Firebase initialized successfully")
                except Exception as e:
                    raise FirebaseConnectionException(
                        f"Failed to connect to Firestore: {str(e)}"
                    ) from e
            else:
                try:
                    self.db = firestore.client()
                    print("Using existing Firebase app")
                except Exception as e:
                    raise FirebaseConnectionException(
                        f"Failed to get Firestore client: {str(e)}"
                    ) from e

        except (FirebaseCredentialsException, FirebaseConnectionException):
            # Re-raise our custom exceptions
            raise
        except Exception as e:
            print(f"Error initializing Firebase: {e}")
            raise FirebaseInitializationException(
                f"Unexpected initialization error: {str(e)}"
            ) from e

    # Counter operations
    def get_next_counter(self, counter_name: str) -> int:
        """Get next counter value and increment"""
        try:
            counter_ref = self.db.collection("counters").document(counter_name)
            counter_doc = counter_ref.get()

            if counter_doc.exists:
                current_value = counter_doc.to_dict().get("value", 0)
                next_value = current_value + 1
                counter_ref.update({"value": next_value})
                return next_value
            else:
                # Initialize counter if it doesn't exist
                counter_ref.set({"value": 1})
                return 1
        except Exception as e:
            print(f"Error getting counter {counter_name}: {e}")
            raise

    # Kiosk operation ---------------------------------------------------------
    def register_kiosk(self, kiosk_data: Dict[str, Any]) -> str:
        """Register a new kiosk with sequential ID (kiosk_001, kiosk_002, ...)"""
        # 1. Get next sequential ID
        try:
            counter = self.get_next_counter("kiosk_counter")
        except Exception as e:
            raise KioskException(f"Failed to get kiosk counter: {str(e)}") from e

        kiosk_id = f"kiosk_{counter:03d}"

        # 2. Add timestamps
        kiosk_data["created_at"] = datetime.now(KST)
        kiosk_data["updated_at"] = datetime.now(KST)

        # 3. Reference Firestore document
        doc_ref = self.db.collection("kiosks").document(kiosk_id)

        # 4. Check if kiosk already exists
        try:
            doc_snapshot = doc_ref.get()
        except Exception as e:
            raise KioskException(
                f"Failed to check existing kiosk {kiosk_id}: {str(e)}"
            ) from e

        if doc_snapshot.exists:
            raise KioskAlreadyExistsException(kid=kiosk_id)

        # 5. Save kiosk
        try:
            doc_ref.set(kiosk_data)
        except Exception as e:
            raise KioskException(
                f"Failed to register kiosk {kiosk_id}: {str(e)}"
            ) from e

        return kiosk_id

    def get_kiosk_by_id(self, kid: str) -> Kiosk:
        """Get a specific kiosk by kid"""
        # 1. Get document reference and fetch
        doc_ref = self.db.collection("kiosks").document(kid)

        try:
            doc = doc_ref.get()
        except Exception as e:
            raise KioskException(f"Failed to get kiosk {kid}: {str(e)}") from e

        # 2. Check if kiosk exists
        if not doc.exists:
            raise KioskNotFoundException(kid=kid)

        # 3. Convert to Kiosk model
        data = doc.to_dict()
        return Kiosk(kid=doc.id, **data)

    def update_kiosk(self, kid: str, kiosk_data: Dict[str, Any]) -> None:
        """Update an existing kiosk"""
        # 1. Get document reference
        doc_ref = self.db.collection("kiosks").document(kid)

        # 2. Check if kiosk exists
        try:
            doc = doc_ref.get()
        except Exception as e:
            raise KioskException(f"Failed to check kiosk {kid}: {str(e)}") from e

        if not doc.exists:
            raise KioskNotFoundException(kid=kid)

        # 3. Add updated timestamp
        kiosk_data["updated_at"] = datetime.now(KST)

        # 4. Update kiosk
        try:
            doc_ref.update(kiosk_data)
        except Exception as e:
            raise KioskException(f"Failed to update kiosk {kid}: {str(e)}") from e

    def delete_kiosk(self, kid: str) -> None:
        """Delete a kiosk by ID"""
        # 1. Get document reference
        doc_ref = self.db.collection("kiosks").document(kid)

        # 2. Check if kiosk exists
        try:
            doc = doc_ref.get()
        except Exception as e:
            raise KioskException(f"Failed to check kiosk {kid}: {str(e)}") from e

        if not doc.exists:
            raise KioskNotFoundException(kid=kid)

        # 3. Delete kiosk
        try:
            doc_ref.delete()
        except Exception as e:
            raise KioskException(f"Failed to delete kiosk {kid}: {str(e)}") from e

    def get_all_kiosks(self) -> List[Dict[str, Any]]:
        """Get all kiosks from Firebase"""
        try:
            kiosks_ref = self.db.collection("kiosks")
            docs = kiosks_ref.stream()

            kiosks = []
            for doc in docs:
                kiosk_data = doc.to_dict()
                kiosk_data["kiosk_id"] = doc.id
                kiosks.append(kiosk_data)

            return kiosks
        except Exception as e:
            raise KioskException(f"Failed to get all kiosks: {str(e)}") from e

    # Product operations -------------------------------------------------
    def register_product(self, product_data: Dict[str, Any]) -> str:
        """Create a new product with sequential ID (prod_001, prod_002, ...)"""
        # 1. Get next sequential ID
        try:
            counter = self.get_next_counter("product_counter")
        except Exception as e:
            raise ProductException(f"Failed to get product counter: {str(e)}") from e

        # 2. Create product ID with zero-padding
        product_id = f"prod_{counter:03d}"

        # 3. Add product_id to product data
        product_data["product_id"] = product_id

        # 4. Reference Firestore document
        doc_ref = self.db.collection("products").document(product_id)

        # 5. Save product
        try:
            doc_ref.set(product_data)
        except Exception as e:
            raise ProductException(
                f"Failed to create product {product_id}: {str(e)}"
            ) from e

        return product_id

    def get_all_products(self) -> List[Product]:
        """Get all products from Firebase with presigned URLs"""
        try:
            products_ref = self.db.collection("products")
            docs = products_ref.stream()

            products = []
            for doc in docs:
                product_data = doc.to_dict()
                try:
                    product = Product(**product_data, pid=doc.id)
                    # Convert S3 key to presigned URL
                    product.image_url = s3_service.convert_to_presigned_url(
                        product.image_url
                    )
                    products.append(product)
                except Exception as e:
                    raise ProductDataCorruptedException(
                        pid=doc.id, reason=str(e)
                    ) from e

            return products
        except ProductDataCorruptedException:
            raise
        except Exception as e:
            raise ProductException(f"Failed to get all products: {str(e)}") from e

    def get_product_by_id(self, pid: str) -> Product:
        """Get a specific product by ID with presigned URL"""
        # 1. Get document reference and fetch
        doc_ref = self.db.collection("products").document(pid)

        try:
            doc = doc_ref.get()
        except Exception as e:
            raise ProductException(f"Failed to get product {pid}: {str(e)}") from e

        # 2. Check if product exists
        if not doc.exists:
            raise ProductNotFoundException(pid=pid)

        # 3. Convert to Product model
        data = doc.to_dict()
        try:
            product = Product(**data, pid=doc.id)
            # Convert S3 key to presigned URL
            product.image_url = s3_service.convert_to_presigned_url(product.image_url)
            return product
        except Exception as e:
            raise ProductDataCorruptedException(pid=pid, reason=str(e)) from e

    def update_product(self, product_id: str, product_data: Dict[str, Any]) -> None:
        """Update an existing product"""
        # 1. Get document reference
        doc_ref = self.db.collection("products").document(product_id)

        # 2. Check if product exists
        try:
            doc = doc_ref.get()
        except Exception as e:
            raise ProductException(
                f"Failed to check product {product_id}: {str(e)}"
            ) from e

        if not doc.exists:
            raise ProductNotFoundException(pid=product_id)

        # 3. Update product
        try:
            doc_ref.update(product_data)
        except Exception as e:
            raise ProductException(
                f"Failed to update product {product_id}: {str(e)}"
            ) from e

    def delete_product(self, product_id: str) -> None:
        """Delete a product by ID"""
        # 1. Get document reference
        doc_ref = self.db.collection("products").document(product_id)

        # 2. Check if product exists
        try:
            doc = doc_ref.get()
        except Exception as e:
            raise ProductException(
                f"Failed to check product {product_id}: {str(e)}"
            ) from e

        if not doc.exists:
            raise ProductNotFoundException(pid=product_id)

        # 3. Delete product
        try:
            doc_ref.delete()
        except Exception as e:
            raise ProductException(
                f"Failed to delete product {product_id}: {str(e)}"
            ) from e

    def upload_product_image(
        self, pid: str, file_obj, filename: str, content_type: str
    ) -> str:
        """Upload product image to S3 and update product"""
        # 1. Check if product exists
        self.get_product_by_id(pid)

        # 2. Generate S3 key
        file_extension = filename.split(".")[-1] if filename else "png"
        s3_key = f"products/{pid}.{file_extension}"

        # 3. Upload to S3
        s3_service.upload_file(file_obj, s3_key, content_type)

        # 4. Update product with image key
        self.update_product(pid, {"image_key": s3_key, "image_url": s3_key})

        return s3_key

    def get_product_image_url(self, pid: str, expires_in: int = 3600) -> str:
        """Get presigned URL for product image"""
        # 1. Get product
        product = self.get_product_by_id(pid)

        # 2. Get image key
        image_key = (
            product.image_key
            if hasattr(product, "image_key") and product.image_key
            else f"products/{pid}.png"
        )

        # 3. Generate presigned URL
        return s3_service.generate_presigned_url(image_key, expires_in)

    # Transaction operations -------------------------------------------------
    def create_transaction(self, payment_data: Dict[str, Any]) -> str:
        """Create a new transaction/payment in Firebase with initial status ONGOING"""
        # 1. Add timestamps and initial status
        try:
            payment_data["status"] = "ONGOING"  # 승인 전 상태
            payment_data["completed"] = False  # 완료 여부
            payment_data["created_at"] = datetime.now(KST)
            payment_data["approved_at"] = None
        except Exception as e:
            raise PaymentException(
                f"Failed to prepare transaction data: {str(e)}"
            ) from e

        # 2. Reference Firestore document
        try:
            doc_ref = self.db.collection("transactions").document()
        except Exception as e:
            raise PaymentException(
                f"Failed to get Firestore document reference: {str(e)}"
            ) from e

        # 3. Save transaction to Firebase
        try:
            doc_ref.set(payment_data)
            return doc_ref.id  # txid
        except Exception as e:
            raise PaymentException(
                f"Failed to create transaction in Firebase: {str(e)}"
            ) from e

    def update_transaction(self, txid: str, updates: Dict[str, Any]) -> None:
        """Update an existing transaction after approval or other events."""
        # 1. Reference Firestore document
        try:
            doc_ref = self.db.collection("transactions").document(txid)
            doc = doc_ref.get()
        except Exception as e:
            raise PaymentException(
                f"Failed to reference transaction {txid}: {str(e)}"
            ) from e

        # 2. Check if transaction exists
        if not doc.exists:
            raise PaymentNotFoundException(txid=txid)

        # 3. Add updated timestamp
        try:
            updates["updated_at"] = datetime.now(KST)
        except Exception as e:
            raise PaymentException(
                f"Failed to add update timestamp for transaction {txid}: {str(e)}"
            ) from e

        # 4. Update transaction in Firebase
        try:
            doc_ref.update(updates)
        except Exception as e:
            raise PaymentException(
                f"Failed to update transaction {txid} in Firebase: {str(e)}"
            ) from e

    def get_all_transactions(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get all transactions from Firebase"""
        try:
            transactions_ref = self.db.collection("transactions").order_by(
                "created_at", direction=firestore.Query.DESCENDING
            )

            if limit:
                transactions_ref = transactions_ref.limit(limit)

            docs = transactions_ref.stream()

            transactions = []
            for doc in docs:
                transaction_data = doc.to_dict()
                transaction_data["transaction_id"] = doc.id
                transactions.append(transaction_data)

            return transactions
        except Exception as e:
            raise PaymentException(f"Failed to get all transactions: {str(e)}") from e

    def get_transaction_by_id(self, txid: str) -> Optional[Payment]:
        """Get a specific transaction/payment by txid and return as Payment model"""
        try:
            doc_ref = self.db.collection("transactions").document(txid)
            doc = doc_ref.get()
        except Exception as e:
            raise PaymentException(
                f"Failed to access transaction {txid}: {str(e)}"
            ) from e

        if not doc.exists:
            raise PaymentNotFoundException(txid)

        try:
            data = doc.to_dict()

            # Firestore timestamp → datetime 처리 (optional)
            if "created_at" in data and hasattr(data["created_at"], "to_pydatetime"):
                data["created_at"] = data["created_at"].to_pydatetime()
            if (
                "approved_at" in data
                and data["approved_at"]
                and hasattr(data["approved_at"], "to_pydatetime")
            ):
                data["approved_at"] = data["approved_at"].to_pydatetime()

            # txid는 doc.id로 덮어쓰기
            return Payment(**data, txid=doc.id)

        except Exception as e:
            raise PaymentException(
                f"Failed to parse transaction {txid} data: {str(e)}"
            ) from e

    def get_transactions_by_kiosk(self, kiosk_id: str) -> List[Dict[str, Any]]:
        """Get all transactions for a specific kiosk"""
        try:
            transactions_ref = (
                self.db.collection("transactions")
                .where("kid", "==", kiosk_id)
                .order_by("created_at", direction=firestore.Query.DESCENDING)
            )
            docs = transactions_ref.stream()

            transactions = []
            for doc in docs:
                transaction_data = doc.to_dict()
                transaction_data["transaction_id"] = doc.id
                transactions.append(transaction_data)

            return transactions
        except Exception as e:
            raise PaymentException(
                f"Failed to get transactions for kiosk {kiosk_id}: {str(e)}"
            ) from e


# create a singleton instance
firebase_service = FirebaseService()
