import qrcode
from io import BytesIO
from urllib.parse import quote
from PIL import Image

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
    "AHN" : "토스뱅크",
    "LEE" : "토스뱅크",
    "HWANG" : "토스뱅크"
}

TOSS_ACCOUNT = {
    "KIM" : "토스뱅크",
    "SOHN": "100175594154",
    "AHN" : "토스뱅크",
    "LEE" : "토스뱅크",
    "HWANG" : "토스뱅크"
}

class QRCodeService:
    """Service for generating Kakao Pay / Toss Pay QR codes"""

    def __init__(self):
        # 빈 초기화
        self.pay_type = None
        self.manager = None
        self.amount = None

    def set_payment_info(self, pay_type: str, manager: str, amount: float | int):
        if pay_type not in ("kakaopay", "toss"):
            raise ValueError(f"Unknown pay_type: {pay_type}")
        if manager not in KAKAO_UID:
            raise ValueError(f"Unknown manager: {manager}")
        self.pay_type = pay_type
        self.manager = manager
        self.amount = amount

    def generate_kakaopay_url(self) -> str:
        if self.manager is None or self.amount is None:
            raise ValueError("Payment info not set")
        amount_int = int(round(self.amount))
        shifted = amount_int << 19
        hex_value = hex(shifted)[2:].upper()
        return f"https://qr.kakaopay.com/{KAKAO_UID[self.manager]}{hex_value}"

    def generate_tosspay_url(self) -> str:
        if self.manager is None or self.amount is None:
            raise ValueError("Payment info not set")
        amount_int = int(round(self.amount))
        bank_str = quote(TOSS_BANK[self.manager])
        return f"supertoss://send?amount={amount_int}&bank={bank_str}&accountNo={TOSS_ACCOUNT[self.manager]}&origin=qr"

    def generate_qr_img(
        self,
        version: int = 1,
        box_size: int = 8,
        border: int = 2,
        fill_color: str = "black",
        back_color: str = "white",
    ) -> BytesIO:
        if self.pay_type is None:
            raise ValueError("Payment info not set")

        url = (
            self.generate_kakaopay_url()
            if self.pay_type == "kakaopay"
            else self.generate_tosspay_url()
        )

        qr = qrcode.QRCode(
            version=version,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=box_size,
            border=border,
        )
        qr.add_data(url)
        qr.make(fit=True)

        img = qr.make_image(fill_color=fill_color, back_color=back_color).convert("RGB")
        img_io = BytesIO()
        img.save(img_io, format="PNG")
        img_io.seek(0)
        return img_io


qrcode_service = QRCodeService()