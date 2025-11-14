import os
import requests
from typing import Dict, Any, Optional
from datetime import datetime
import secrets


class PaymentService:
    """Payment service for handling external payment API integration (e.g., KakaoPay)"""

    def __init__(self):
        # Kakao Pay API credentials
        self.kakao_admin_key = os.getenv("KAKAO_ADMIN_KEY", "")
        self.kakao_cid = os.getenv("KAKAO_CID", "TC0ONETIME")  # Test CID for development
        self.kakao_api_url = "https://open-api.kakaopay.com/online/v1/payment"

        # Generic payment API credentials (for other payment methods)
        self.api_key = os.getenv("PAYMENT_API_KEY", "")
        self.api_secret = os.getenv("PAYMENT_API_SECRET", "")
        self.base_url = os.getenv("PAYMENT_API_URL", "https://api.example.com/payment")

        # Store pending payments in memory (in production, use Redis or database)
        self.pending_payments: Dict[str, Dict[str, Any]] = {}

    async def initialize_payment(self, transaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Initialize a payment request

        Args:
            transaction_data: Dictionary containing transaction information
                - transaction_id: str
                - amount: float
                - payment_method: str
                - customer_id: Optional[str]

        Returns:
            Dictionary with payment initialization response
        """
        try:
            # Placeholder for actual payment API call
            # Example for KakaoPay or similar service

            payload = {
                "transaction_id": transaction_data.get("transaction_id"),
                "amount": transaction_data.get("amount"),
                "payment_method": transaction_data.get("payment_method"),
                "customer_id": transaction_data.get("customer_id"),
                "timestamp": datetime.now().isoformat()
            }

            # Uncomment when integrating with actual payment API
            # headers = {
            #     "Authorization": f"Bearer {self.api_key}",
            #     "Content-Type": "application/json"
            # }
            # response = requests.post(
            #     f"{self.base_url}/initialize",
            #     json=payload,
            #     headers=headers
            # )
            # return response.json()

            # Mock response for development
            return {
                "status": "success",
                "payment_id": f"PAY_{transaction_data.get('transaction_id')}",
                "redirect_url": f"https://payment.example.com/checkout/{transaction_data.get('transaction_id')}",
                "message": "Payment initialized successfully (mock)"
            }

        except Exception as e:
            print(f"Error initializing payment: {e}")
            return {
                "status": "error",
                "message": str(e)
            }

    async def confirm_payment(self, payment_id: str) -> Dict[str, Any]:
        """
        Confirm a payment after user approval

        Args:
            payment_id: Payment ID from initialization

        Returns:
            Dictionary with payment confirmation response
        """
        try:
            # Placeholder for actual payment confirmation API call

            # Uncomment when integrating with actual payment API
            # headers = {
            #     "Authorization": f"Bearer {self.api_key}",
            #     "Content-Type": "application/json"
            # }
            # response = requests.post(
            #     f"{self.base_url}/confirm",
            #     json={"payment_id": payment_id},
            #     headers=headers
            # )
            # return response.json()

            # Mock response for development
            return {
                "status": "success",
                "payment_id": payment_id,
                "payment_status": "completed",
                "confirmed_at": datetime.now().isoformat(),
                "message": "Payment confirmed successfully (mock)"
            }

        except Exception as e:
            print(f"Error confirming payment: {e}")
            return {
                "status": "error",
                "message": str(e)
            }

    async def cancel_payment(self, payment_id: str, reason: Optional[str] = None) -> Dict[str, Any]:
        """
        Cancel a pending payment

        Args:
            payment_id: Payment ID to cancel
            reason: Optional cancellation reason

        Returns:
            Dictionary with cancellation response
        """
        try:
            # Placeholder for actual payment cancellation API call

            payload = {
                "payment_id": payment_id,
                "reason": reason or "User cancelled"
            }

            # Uncomment when integrating with actual payment API
            # headers = {
            #     "Authorization": f"Bearer {self.api_key}",
            #     "Content-Type": "application/json"
            # }
            # response = requests.post(
            #     f"{self.base_url}/cancel",
            #     json=payload,
            #     headers=headers
            # )
            # return response.json()

            # Mock response for development
            return {
                "status": "success",
                "payment_id": payment_id,
                "payment_status": "cancelled",
                "cancelled_at": datetime.now().isoformat(),
                "message": "Payment cancelled successfully (mock)"
            }

        except Exception as e:
            print(f"Error cancelling payment: {e}")
            return {
                "status": "error",
                "message": str(e)
            }

    async def refund_payment(self, payment_id: str, amount: Optional[float] = None) -> Dict[str, Any]:
        """
        Refund a completed payment

        Args:
            payment_id: Payment ID to refund
            amount: Optional partial refund amount (full refund if None)

        Returns:
            Dictionary with refund response
        """
        try:
            # Placeholder for actual payment refund API call

            payload = {
                "payment_id": payment_id,
                "amount": amount,
                "refund_type": "partial" if amount else "full"
            }

            # Uncomment when integrating with actual payment API
            # headers = {
            #     "Authorization": f"Bearer {self.api_key}",
            #     "Content-Type": "application/json"
            # }
            # response = requests.post(
            #     f"{self.base_url}/refund",
            #     json=payload,
            #     headers=headers
            # )
            # return response.json()

            # Mock response for development
            return {
                "status": "success",
                "payment_id": payment_id,
                "refund_amount": amount or 0,
                "refund_status": "completed",
                "refunded_at": datetime.now().isoformat(),
                "message": "Payment refunded successfully (mock)"
            }

        except Exception as e:
            print(f"Error refunding payment: {e}")
            return {
                "status": "error",
                "message": str(e)
            }

    async def get_payment_status(self, payment_id: str) -> Dict[str, Any]:
        """
        Get the current status of a payment

        Args:
            payment_id: Payment ID to check

        Returns:
            Dictionary with payment status information
        """
        try:
            # Placeholder for actual payment status API call

            # Uncomment when integrating with actual payment API
            # headers = {
            #     "Authorization": f"Bearer {self.api_key}"
            # }
            # response = requests.get(
            #     f"{self.base_url}/status/{payment_id}",
            #     headers=headers
            # )
            # return response.json()

            # Mock response for development
            return {
                "status": "success",
                "payment_id": payment_id,
                "payment_status": "completed",
                "amount": 0,
                "message": "Payment status retrieved successfully (mock)"
            }

        except Exception as e:
            print(f"Error getting payment status: {e}")
            return {
                "status": "error",
                "message": str(e)
            }

    async def kakao_pay_prepare(self, payment_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Prepare a Kakao Pay payment

        Args:
            payment_data: Dictionary containing payment information
                - kiosk_id: str
                - product_id: str
                - product_name: str
                - amount_grams: int
                - extra_bottle: bool
                - product_price: float
                - total_price: float

        Returns:
            Dictionary with tid and next_redirect_pc_url
        """
        try:
            # Generate unique partner_order_id and partner_user_id
            partner_order_id = f"ORDER_{secrets.token_hex(8)}"
            partner_user_id = payment_data.get("kiosk_id", "KIOSK_USER")

            # Prepare request payload for Kakao Pay
            # Note: approval_url, cancel_url, fail_url will receive pg_token as query parameter
            payload = {
                "cid": self.kakao_cid,
                "partner_order_id": partner_order_id,
                "partner_user_id": partner_user_id,
                "item_name": payment_data.get("product_name", "Product"),
                "quantity": 1,
                "total_amount": int(payment_data.get("total_price", 0)),
                "tax_free_amount": 0,
                "approval_url": os.getenv("KAKAO_APPROVAL_URL", "http://localhost:3000/payment/success"),
                "cancel_url": os.getenv("KAKAO_CANCEL_URL", "http://localhost:3000/payment/cancel"),
                "fail_url": os.getenv("KAKAO_FAIL_URL", "http://localhost:3000/payment/fail")
            }

            headers = {
                "Authorization": self.kakao_admin_key,
                "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
            }

            # In development mode, return mock response if no admin key is set
            if not self.kakao_admin_key:
                print("Kakao Pay Admin Key not set - using mock response")
                mock_tid = f"T{secrets.token_hex(10)}"

                # Store payment info for later approval
                self.pending_payments[mock_tid] = {
                    "partner_order_id": partner_order_id,
                    "payment_data": payment_data,
                    "created_at": datetime.now().isoformat()
                }

                return {
                    "tid": mock_tid,
                    "next_redirect_pc_url": f"https://mockpay.kakao.com/redirect?tid={mock_tid}",
                    "created_at": datetime.now().isoformat()
                }

            # Make actual API call to Kakao Pay
            response = requests.post(
                f"{self.kakao_api_url}/ready",
                data=payload,
                headers=headers
            )

            if response.status_code == 200:
                result = response.json()
                # Store tid for later approval
                self.pending_payments[result["tid"]] = {
                    "partner_order_id": partner_order_id,
                    "payment_data": payment_data,
                    "created_at": datetime.now().isoformat()
                }
                return result
            else:
                raise Exception(f"Kakao Pay API error: {response.text}")

        except Exception as e:
            print(f"Error preparing Kakao Pay payment: {e}")
            raise

    async def kakao_pay_approve(self, tid: str, pg_token: str) -> Dict[str, Any]:
        """
        Approve a Kakao Pay payment

        Args:
            tid: Transaction ID from prepare step
            pg_token: Payment gateway token from Kakao Pay redirect

        Returns:
            Dictionary with payment approval details
        """
        try:
            # Get stored payment info
            payment_info = self.pending_payments.get(tid)
            if not payment_info:
                raise Exception(f"Payment with tid {tid} not found")

            # In development mode, return mock response if no admin key is set
            if not self.kakao_admin_key:
                print("Kakao Pay Admin Key not set - using mock approval")

                # Store payment_data before cleanup
                payment_data = payment_info.get("payment_data", {})

                # Clean up pending payment
                del self.pending_payments[tid]

                return {
                    "tid": tid,
                    "status": "success",
                    "approved_at": datetime.now().isoformat(),
                    "partner_order_id": payment_info["partner_order_id"],
                    "payment_method_type": "MONEY",
                    "payment_data": payment_data  # Include original payment data
                }

            # Prepare approval request
            payload = {
                "cid": self.kakao_cid,
                "tid": tid,
                "partner_order_id": payment_info["partner_order_id"],
                "partner_user_id": payment_info["payment_data"].get("kiosk_id", "KIOSK_USER"),
                "pg_token": pg_token
            }

            headers = {
                "Authorization": self.kakao_admin_key,
                "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
            }

            # Make actual API call to Kakao Pay
            response = requests.post(
                f"{self.kakao_api_url}/approve",
                data=payload,
                headers=headers
            )

            if response.status_code == 200:
                result = response.json()

                # Store payment_data before cleanup
                payment_data = payment_info.get("payment_data", {})

                # Clean up pending payment
                del self.pending_payments[tid]

                return {
                    "tid": result.get("tid"),
                    "status": "success",
                    "approved_at": result.get("approved_at"),
                    "partner_order_id": result.get("partner_order_id"),
                    "payment_method_type": result.get("payment_method_type"),
                    "payment_data": payment_data  # Include original payment data
                }
            else:
                raise Exception(f"Kakao Pay approval error: {response.text}")

        except Exception as e:
            print(f"Error approving Kakao Pay payment: {e}")
            raise


# Global payment service instance
payment_service = PaymentService()
