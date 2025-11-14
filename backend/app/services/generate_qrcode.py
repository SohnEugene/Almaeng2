import qrcode
from io import BytesIO
from PIL import Image

class QRCodeService:
    """Service for generating Kakao Pay QR codes"""

    def __init__(self, uid: str = "FNutg4ymq"):
        self.uid = uid

    def generate_kakaopay_url(self, amount: float | int) -> str:
        amount_int = int(round(amount))  # 반올림 후 정수로 변환
        shifted = amount_int << 19
        hex_value = hex(shifted)[2:].upper()
        return f"https://qr.kakaopay.com/{self.uid}{hex_value}"

    def generate_qr_code(
        self,
        amount: int,
        version: int = 1,
        box_size: int = 8,
        border: int = 2,
        fill_color: str = "black",
        back_color: str = "white",
    ) -> BytesIO:
        """
        Generate QR code as a BytesIO object (PNG) for direct HTTP response.
        """
        url = self.generate_kakaopay_url(amount)

        qr = qrcode.QRCode(
            version=version,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=box_size,
            border=border,
        )
        qr.add_data(url)
        qr.make(fit=True)

        img = qr.make_image(fill_color=fill_color, back_color=back_color).convert("RGB")

        # Save image to BytesIO
        img_io = BytesIO()
        img.save(img_io, format="PNG")
        img_io.seek(0)  # 읽기 시작점 초기화

        return img_io


# Global instance
qrcode_service = QRCodeService()
