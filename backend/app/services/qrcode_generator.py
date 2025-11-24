import qrcode
from io import BytesIO
from urllib.parse import quote
from app.exceptions import (
    QRCodeGenerationException,
    InvalidPaymentTypeException,
    InvalidManagerException,
    PaymentInfoNotSetException
)

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

    def __init__(self):
        self.pay_type = None
        self.manager = None
        self.amount = None

    def set_payment_info(self, pay_type: str, manager: str, amount: float | int):
        if pay_type not in ("kakaopay", "tosspay"):
            raise InvalidPaymentTypeException(pay_type)
        
        manager_upper = manager.upper()
        if manager_upper not in KAKAO_UID:
            raise InvalidManagerException(manager, list(KAKAO_UID.keys()))

        self.pay_type = pay_type
        self.manager = manager_upper
        self.amount = amount

    def generate_kakaopay_url(self) -> str:
        if self.manager is None or self.amount is None:
            raise PaymentInfoNotSetException()

        try:
            amount_int = int(round(self.amount))
            shifted = amount_int << 19
            hex_value = hex(shifted)[2:].upper()
            return f"https://qr.kakaopay.com/{KAKAO_UID[self.manager]}{hex_value}"
        except Exception as e:
            raise QRCodeGenerationException(f"Failed to generate Kakao Pay URL: {str(e)}")

    def generate_tosspay_url(self) -> str:
        if self.manager is None or self.amount is None:
            raise PaymentInfoNotSetException()

        try:
            amount_int = int(round(self.amount))
            bank_str = quote(TOSS_BANK[self.manager])
            return_str = f"supertoss://send?amount={amount_int}&bank={bank_str}&accountNo={TOSS_ACCOUNT[self.manager]}&origin=qr"
            print(return_str)
            return return_str
        except Exception as e:
            raise QRCodeGenerationException(f"Failed to generate Toss Pay URL: {str(e)}")

    def generate_qr_img(
        self,
        version: int = 1,
        box_size: int = 8,
        border: int = 2,
        fill_color: str = "black",
        back_color: str = "white",
    ) -> BytesIO:
        try:
            # Generate URL based on payment type (will raise PaymentInfoNotSetException if not set)
            url = (
                self.generate_kakaopay_url()
                if self.pay_type == "kakaopay"
                else self.generate_tosspay_url()
            )

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
        except (InvalidPaymentTypeException, InvalidManagerException, PaymentInfoNotSetException, QRCodeGenerationException):
            raise
        except Exception as e:
            raise QRCodeGenerationException(f"Unexpected error during QR code generation: {str(e)}")


# create a singleton instance
qrcode_service = QRCodeService()