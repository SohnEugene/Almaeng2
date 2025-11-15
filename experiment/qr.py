import qrcode

uid = "FNutg4ymq"

def kakaopay_qr(uid, amount):
    print(f"원래 금액: {amount}원")

    # amount를 2진수로 변환
    binary = bin(amount)
    print(f"2진수: {binary}")

    # 2진수로 변환한 값을 왼쪽으로 19비트 시프트
    shifted = amount << 19
    print(f"19비트 왼쪽 시프트: {shifted}")

    # 해당 숫자를 16진수로 다시 변환
    hex_value = hex(shifted)[2:].upper()  # '0x' 제거하고 대문자로
    print(f"16진수: {hex_value}")

    return f"https://qr.kakaopay.com/{uid}{hex_value}"

qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_L,
    box_size=8,
    border=2,
)
qr.add_data("supertoss://send?amount=1000&bank=%ED%86%A0%EC%8A%A4%EB%B1%85%ED%81%AC&accountNo=100175594154&origin=qr")
qr.make(fit=True)
qr.make_image(fill_color="black", back_color="white").save("kakaopay_qr.png")