import os
import firebase_admin
from firebase_admin import credentials, firestore
from typing import List, Dict, Optional, Any
from datetime import datetime
import json

from app.exceptions import (
    KioskException,
    KioskAlreadyExistsException,
    KioskNotFoundException,
    KioskInvalidDataException
)
from app.exceptions.products_exceptions import (
    ProductException,
    ProductNotFoundException,
    ProductDataCorruptedException
)
from app.models import Kiosk, Product


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
                    cred = credentials.Certificate(cred_path)
                    firebase_admin.initialize_app(cred)
                else:
                    # Fall back to credentials JSON string
                    firebase_json = os.environ.get("FIREBASE_CREDENTIALS_JSON")
                    if firebase_json:
                        cred = credentials.Certificate(json.loads(firebase_json))
                        firebase_admin.initialize_app(cred)
                    else:
                        cred_json = os.getenv("FIREBASE_CREDENTIALS_JSON")
                        if cred_json:
                            cred_dict = json.loads(cred_json)
                            cred = credentials.Certificate(cred_dict)
                            firebase_admin.initialize_app(cred)
                        else:
                            raise ValueError("Firebase credentials not found. Set FIREBASE_CREDENTIALS_PATH or FIREBASE_CREDENTIALS_JSON")

                self.db = firestore.client()
                print("Firebase initialized successfully")
            else:
                self.db = firestore.client()
                print("Using existing Firebase app")

        except Exception as e:
            print(f"Error initializing Firebase: {e}")
            raise

    # Counter operations
    def get_next_counter(self, counter_name: str) -> int:
        """Get next counter value and increment"""
        try:
            counter_ref = self.db.collection('counters').document(counter_name)
            counter_doc = counter_ref.get()

            if counter_doc.exists:
                current_value = counter_doc.to_dict().get('value', 0)
                next_value = current_value + 1
                counter_ref.update({'value': next_value})
                return next_value
            else:
                # Initialize counter if it doesn't exist
                counter_ref.set({'value': 1})
                return 1
        except Exception as e:
            print(f"Error getting counter {counter_name}: {e}")
            raise



    # Kiosk operation ---------------------------------------------------------
    def register_kiosk(self, kiosk_data: Dict[str, Any]) -> str:
        """Register a new kiosk with sequential ID (kiosk_001, kiosk_002, ...)"""
        # 1. Get next sequential ID
        try:
            counter = self.get_next_counter('kiosk_counter')
        except Exception as e:
            raise KioskException(f"Failed to get kiosk counter: {str(e)}") from e

        kiosk_id = f"kiosk_{counter:03d}"

        # 2. Add timestamps
        kiosk_data['created_at'] = datetime.now()
        kiosk_data['updated_at'] = datetime.now()

        # 3. Reference Firestore document
        doc_ref = self.db.collection('kiosks').document(kiosk_id)

        # 4. Check if kiosk already exists
        try:
            doc_snapshot = doc_ref.get()
        except Exception as e:
            raise KioskException(f"Failed to check existing kiosk {kiosk_id}: {str(e)}") from e

        if doc_snapshot.exists:
            raise KioskAlreadyExistsException(kid=kiosk_id)

        # 5. Save kiosk
        try:
            doc_ref.set(kiosk_data)
        except Exception as e:
            raise KioskException(f"Failed to register kiosk {kiosk_id}: {str(e)}") from e

        return kiosk_id

    def get_kiosk_by_id(self, kid: str) -> Kiosk:
        """Get a specific kiosk by kid"""
        # 1. Get document reference and fetch
        doc_ref = self.db.collection('kiosks').document(kid)

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
        doc_ref = self.db.collection('kiosks').document(kid)

        # 2. Check if kiosk exists
        try:
            doc = doc_ref.get()
        except Exception as e:
            raise KioskException(f"Failed to check kiosk {kid}: {str(e)}") from e

        if not doc.exists:
            raise KioskNotFoundException(kid=kid)

        # 3. Add updated timestamp
        kiosk_data['updated_at'] = datetime.now()

        # 4. Update kiosk
        try:
            doc_ref.update(kiosk_data)
        except Exception as e:
            raise KioskException(f"Failed to update kiosk {kid}: {str(e)}") from e

    def get_all_kiosks(self) -> List[Dict[str, Any]]:
        """Get all kiosks from Firebase"""
        try:
            kiosks_ref = self.db.collection('kiosks')
            docs = kiosks_ref.stream()

            kiosks = []
            for doc in docs:
                kiosk_data = doc.to_dict()
                kiosk_data['kiosk_id'] = doc.id
                kiosks.append(kiosk_data)

            return kiosks
        except Exception as e:
            print(f"Error getting kiosks: {e}")
            return []



    # Product operations -------------------------------------------------
    def register_product(self, product_data: Dict[str, Any]) -> str:
        """Create a new product with sequential ID (prod_001, prod_002, ...)"""
        # 1. Get next sequential ID
        try:
            counter = self.get_next_counter('product_counter')
        except Exception as e:
            raise ProductException(f"Failed to get product counter: {str(e)}") from e

        # 2. Create product ID with zero-padding
        product_id = f"prod_{counter:03d}"

        # 3. Add product_id to product data
        product_data['product_id'] = product_id

        # 4. Reference Firestore document
        doc_ref = self.db.collection('products').document(product_id)

        # 5. Save product
        try:
            doc_ref.set(product_data)
        except Exception as e:
            raise ProductException(f"Failed to create product {product_id}: {str(e)}") from e

        return product_id
    
    def get_all_products(self) -> List[Product]:
        """Get all products from Firebase"""
        try:
            products_ref = self.db.collection('products')
            docs = products_ref.stream()

            products = []
            for doc in docs:
                product_data = doc.to_dict()
                try:
                    product = Product(**product_data, pid=doc.id)
                    products.append(product)
                except Exception as e:
                    raise ProductDataCorruptedException(pid=doc.id, reason=str(e)) from e

            return products
        except ProductDataCorruptedException:
            raise
        except Exception as e:
            raise ProductException(f"Failed to get all products: {str(e)}") from e

    def get_product_by_id(self, pid: str) -> Product:
        """Get a specific product by ID"""
        # 1. Get document reference and fetch
        doc_ref = self.db.collection('products').document(pid)

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
            return Product(**data, pid=doc.id)
        except Exception as e:
            raise ProductDataCorruptedException(pid=pid, reason=str(e)) from e
    
    def update_product(self, product_id: str, product_data: Dict[str, Any]) -> None:
        """Update an existing product"""
        # 1. Get document reference
        doc_ref = self.db.collection('products').document(product_id)

        # 2. Check if product exists
        try:
            doc = doc_ref.get()
        except Exception as e:
            raise ProductException(f"Failed to check product {product_id}: {str(e)}") from e

        if not doc.exists:
            raise ProductNotFoundException(pid=product_id)

        # 3. Update product
        try:
            doc_ref.update(product_data)
        except Exception as e:
            raise ProductException(f"Failed to update product {product_id}: {str(e)}") from e



    # Transaction operations -------------------------------------------------
    def get_all_transactions(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get all transactions from Firebase"""
        try:
            transactions_ref = self.db.collection('transactions').order_by('timestamp', direction=firestore.Query.DESCENDING)

            if limit:
                transactions_ref = transactions_ref.limit(limit)

            docs = transactions_ref.stream()

            transactions = []
            for doc in docs:
                transaction_data = doc.to_dict()
                transaction_data['transaction_id'] = doc.id
                transactions.append(transaction_data)

            return transactions
        except Exception as e:
            print(f"Error getting transactions: {e}")
            return []

    def get_transaction_by_id(self, transaction_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific transaction by ID"""
        try:
            doc_ref = self.db.collection('transactions').document(transaction_id)
            doc = doc_ref.get()

            if doc.exists:
                transaction_data = doc.to_dict()
                transaction_data['transaction_id'] = doc.id
                return transaction_data
            return None
        except Exception as e:
            print(f"Error getting transaction {transaction_id}: {e}")
            return None

    def create_transaction(self, transaction_data: Dict[str, Any]) -> str:
        """Create a new transaction"""
        try:
            doc_ref = self.db.collection('transactions').document()
            doc_ref.set(transaction_data)

            return doc_ref.id
        except Exception as e:
            print(f"Error creating transaction: {e}")
            raise

    def get_transactions_by_kiosk(self, kiosk_id: str) -> List[Dict[str, Any]]:
        """Get all transactions for a specific kiosk"""
        try:
            transactions_ref = self.db.collection('transactions').where('kiosk_id', '==', kiosk_id).order_by('timestamp', direction=firestore.Query.DESCENDING)
            docs = transactions_ref.stream()

            transactions = []
            for doc in docs:
                transaction_data = doc.to_dict()
                transaction_data['transaction_id'] = doc.id
                transactions.append(transaction_data)

            return transactions
        except Exception as e:
            print(f"Error getting transactions for kiosk {kiosk_id}: {e}")
            return []


# Global Firebase service instance
firebase_service = FirebaseService()
