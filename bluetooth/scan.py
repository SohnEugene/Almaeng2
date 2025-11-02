from bleak import BleakScanner
import asyncio

async def scan():
    devices = await BleakScanner.discover()
    for d in devices:
        # RSSI 가져오기 (버전에 따라 구조 다름)
        rssi = getattr(d, "rssi", None)
        if rssi is None:
            # 최신 버전일 경우 details에서 시도
            details = getattr(d, "details", None)
            if isinstance(details, dict):
                rssi = details.get("rssi")

        print(f"Name: {d.name or 'Unknown'}, Address: {d.address}, RSSI: {rssi}")

asyncio.run(scan())
