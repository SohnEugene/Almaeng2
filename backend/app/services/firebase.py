import os
import firebase_admin
from firebase_admin import credentials, firestore
from typing import List, Dict, Optional, Any
from datetime import datetime
import json


class FirebaseService:
    """Firebase service for database operations"""

    def __init__(self):
        self.db = None

    def initialize(self):
        """Initialize Firebase Admin SDK"""
        try:
            # Check if already initialized
            if not firebase_admin._apps:
                # Get credentials from environment variable
                cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")

                if cred_path and os.path.exists(cred_path):
                    cred = credentials.Certificate(cred_path)
                    firebase_admin.initialize_app(cred)
                else:
                    # For development, you can also use a credentials JSON string
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
    async def get_next_counter(self, counter_name: str) -> int:
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

    # Kiosk operations
    async def get_all_kiosks(self) -> List[Dict[str, Any]]:
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

    async def get_kiosk_by_id(self, kiosk_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific kiosk by ID"""
        try:
            doc_ref = self.db.collection('kiosks').document(kiosk_id)
            doc = doc_ref.get()

            if doc.exists:
                kiosk_data = doc.to_dict()
                kiosk_data['kiosk_id'] = doc.id
                return kiosk_data
            return None
        except Exception as e:
            print(f"Error getting kiosk {kiosk_id}: {e}")
            return None

    async def create_kiosk(self, kiosk_data: Dict[str, Any]) -> str:
        """Create a new kiosk with sequential ID (kiosk_001, kiosk_002, ...)"""
        try:
            # Get next counter value
            counter = await self.get_next_counter('kiosk_counter')

            # Create kiosk ID with zero-padding (kiosk_001, kiosk_002, ...)
            kiosk_id = f"kiosk_{counter:03d}"

            kiosk_data['created_at'] = datetime.now()
            kiosk_data['updated_at'] = datetime.now()

            # Use the custom kiosk_id as document ID
            doc_ref = self.db.collection('kiosks').document(kiosk_id)
            doc_ref.set(kiosk_data)

            return kiosk_id
        except Exception as e:
            print(f"Error creating kiosk: {e}")
            raise

    async def update_kiosk(self, kiosk_id: str, kiosk_data: Dict[str, Any]) -> bool:
        """Update an existing kiosk"""
        try:
            kiosk_data['updated_at'] = datetime.now()

            doc_ref = self.db.collection('kiosks').document(kiosk_id)
            doc_ref.update(kiosk_data)

            return True
        except Exception as e:
            print(f"Error updating kiosk {kiosk_id}: {e}")
            return False

    # Product operations
    async def get_all_products(self) -> List[Dict[str, Any]]:
        """Get all products from Firebase"""
        try:
            products_ref = self.db.collection('products')
            docs = products_ref.stream()

            products = []
            for doc in docs:
                product_data = doc.to_dict()
                product_data['product_id'] = doc.id
                products.append(product_data)

            return products
        except Exception as e:
            print(f"Error getting products: {e}")
            return []

    async def get_product_by_id(self, product_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific product by ID"""
        try:
            doc_ref = self.db.collection('products').document(product_id)
            doc = doc_ref.get()

            if doc.exists:
                product_data = doc.to_dict()
                product_data['product_id'] = doc.id
                return product_data
            return None
        except Exception as e:
            print(f"Error getting product {product_id}: {e}")
            return None

    async def create_product(self, product_data: Dict[str, Any]) -> str:
        """Create a new product with sequential ID (prod_001, prod_002, ...)"""
        try:
            # Get next counter value
            counter = await self.get_next_counter('product_counter')

            # Create product ID with zero-padding (prod_001, prod_002, ...)
            product_id = f"prod_{counter:03d}"

            # Add product_id to product data
            product_data['product_id'] = product_id
            product_data['available'] = product_data.get('available', True)

            # Use the custom product_id as document ID
            doc_ref = self.db.collection('products').document(product_id)
            doc_ref.set(product_data)

            return product_id
        except Exception as e:
            print(f"Error creating product: {e}")
            raise

    async def update_product(self, product_id: str, product_data: Dict[str, Any]) -> bool:
        """Update an existing product"""
        try:
            doc_ref = self.db.collection('products').document(product_id)
            doc_ref.update(product_data)

            return True
        except Exception as e:
            print(f"Error updating product {product_id}: {e}")
            return False

    # Transaction operations
    async def get_all_transactions(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
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

    async def get_transaction_by_id(self, transaction_id: str) -> Optional[Dict[str, Any]]:
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

    async def create_transaction(self, transaction_data: Dict[str, Any]) -> str:
        """Create a new transaction"""
        try:
            doc_ref = self.db.collection('transactions').document()
            doc_ref.set(transaction_data)

            return doc_ref.id
        except Exception as e:
            print(f"Error creating transaction: {e}")
            raise

    async def get_transactions_by_kiosk(self, kiosk_id: str) -> List[Dict[str, Any]]:
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
