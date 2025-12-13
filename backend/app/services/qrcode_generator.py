from io import BytesIO
from urllib.parse import quote

import qrcode

from app.exceptions import QRCodeGenerationException

KAKAO_UID = {
    "KIM" : "FY0PfA6Rh",
    "SOHN": "FNutg4ymq",
    "AHN" : "FE4OcxwKl",
    "LEE" : "FauZdCtoD",
    "HWANG" :"Ej7jq9DMe"
}

TOSS_BANK = {
    "KIM" : "토스뱅크",
    "SOHN": "토스뱅크",
    "AHN" : "국민은행",
    "LEE" : "국민은행",
    "HWANG" : "국민은행"
}

TOSS_ACCOUNT = {
    "KIM" : "100020873228",
    "SOHN": "100175594154",
    "AHN" : "83100200019123",
    "LEE" : "663210408036",
    "HWANG" : "34780104124233"
}

class QRCodeService:
    """
    QR Code generation service for payment systems.
    Assumes all data validation is done at the router layer.
    """

    def _generate_kakaopay_url(self, manager: str, amount: float | int) -> str:
        """Generate Kakao Pay URL from manager and amount"""
        try:
            amount_int = int(round(amount))
            shifted = amount_int << 19
            hex_value = hex(shifted)[2:].upper()
            return f"https://qr.kakaopay.com/{KAKAO_UID[manager]}{hex_value}"
        except KeyError:
            raise QRCodeGenerationException(f"Manager '{manager}' not found in KAKAO_UID configuration")
        except Exception as e:
            raise QRCodeGenerationException(f"Failed to generate Kakao Pay URL: {str(e)}")

    def _generate_tosspay_url(self, manager: str, amount: float | int) -> str:
        """Generate Toss Pay URL from manager and amount"""
        try:
            amount_int = int(round(amount))
            bank_str = quote(TOSS_BANK[manager])
            return f"supertoss://send?amount={amount_int}&bank={bank_str}&accountNo={TOSS_ACCOUNT[manager]}&origin=qr"
        except KeyError:
            raise QRCodeGenerationException(f"Manager '{manager}' not found in TOSS configuration")
        except Exception as e:
            raise QRCodeGenerationException(f"Failed to generate Toss Pay URL: {str(e)}")

    def generate_qr_code(
        self,
        payment_method: str,
        manager: str,
        amount: float | int,
        version: int = 1,
        box_size: int = 8,
        border: int = 2,
        fill_color: str = "black",
        back_color: str = "white",
    ) -> BytesIO:
        """
        Generate QR code image for payment.

        Args:
            payment_method: Payment method ("kakaopay" or "tosspay")
            manager: Manager name (validated at router layer)
            amount: Payment amount
            version: QR code version
            box_size: Size of each box in pixels
            border: Border size in boxes
            fill_color: QR code color
            back_color: Background color

        Returns:
            BytesIO: QR code image as PNG

        Raises:
            QRCodeGenerationException: If QR code generation fails
        """
        try:
            # Generate URL based on payment method
            if payment_method == "kakaopay":
                url = self._generate_kakaopay_url(manager, amount)
            else:  # tosspay
                url = self._generate_tosspay_url(manager, amount)

            # Create QR code
            qr = qrcode.QRCode(
                version=version,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=box_size,
                border=border,
            )
            qr.add_data(url)
            qr.make(fit=True)

            # Generate image
            img = qr.make_image(fill_color=fill_color, back_color=back_color).convert("RGB")
            img_io = BytesIO()
            img.save(img_io, format="PNG")
            img_io.seek(0)
            return img_io
        except QRCodeGenerationException:
            raise
        except Exception as e:
            raise QRCodeGenerationException(f"Unexpected error during QR code generation: {str(e)}")


# create a singleton instance
qrcode_service = QRCodeService()