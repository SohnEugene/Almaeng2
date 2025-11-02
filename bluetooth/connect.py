import asyncio
from bleak import BleakClient, BleakScanner
import os
from pathlib import Path
from dotenv import load_dotenv

# .env 파일에서 환경 변수를 로드
dotenv_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path)

# 환경변수 불러오기
GOTOBAKE_ADDRESS = os.getenv("GOTOBAKE_ADDRESS")
HOTO_ADDRESS = os.getenv("HOTO_ADDRESS")

# 연결할 장치의 주소
TARGET_ADDRESS = GOTOBAKE_ADDRESS  # 또는 HOTO_ADDRESS

async def main(address):
    print(f"'{address}' 주소를 가진 장치를 찾고 연결을 시도합니다...")

    # 주소로 장치를 먼저 찾습니다. 타임아웃을 20초로 설정합니다.
    device = await BleakScanner.find_device_by_address(address, timeout=20.0)

    if not device:
        print(f"오류: '{address}' 주소의 장치를 찾을 수 없습니다. 장치가 켜져 있고 범위 내에 있는지 확인하세요.")
        return

    print(f"장치를 찾았습니다. 이제 연결합니다...")

    # 찾은 장치에 연결합니다.
    async with BleakClient(device) as client:
        if client.is_connected:
            print(f"성공적으로 연결되었습니다!")

            # 장치가 제공하는 서비스 및 특성 목록을 출력합니다.
            print("\n--- 서비스(Services) 및 특성(Characteristics) ---")
            for service in client.services:
                print(f"[서비스] UUID: {service.uuid}")
                for char in service.characteristics:
                    # 특성의 속성(읽기, 쓰기, 알림 등)을 쉼표로 구분하여 나열합니다.
                    properties = ", ".join(char.properties)
                    print(f"  [특성] UUID: {char.uuid} | 속성: [{properties}]")
            print("--------------------------------------------------\n")

        else:
            print(f"'{address}' 장치에 연결하지 못했습니다.")

if __name__ == "__main__":
    print("GOTOBAKE_ADDRESS:", GOTOBAKE_ADDRESS)
    print("HOTO_ADDRESS:", HOTO_ADDRESS)
    try:
        asyncio.run(main(TARGET_ADDRESS))
    except Exception as e:
        print(f"오류 발생: {e}")

