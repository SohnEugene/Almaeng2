from bleak import BleakScanner
import asyncio

async def scan_devices():
    print("Scanning for Bluetooth devices...")
    devices = await BleakScanner.discover()
    result = {}
    for d in devices:
        rssi = getattr(d, "rssi", None)
        if rssi is None:
            details = getattr(d, "details", None)
            if isinstance(details, dict):
                rssi = details.get("rssi")
        result[d.address] = {
            "name": d.name or "Unknown",
            "rssi": rssi
        }
    return result

async def main():
    print("Step 1: Scan with the scale OFF")
    print("Please make sure the scale is turned OFF and press Enter to start scanning...")
    input()
    devices_off = await scan_devices()
    print(f"Found {len(devices_off)} devices with scale OFF.\n")

    print("Step 2: Turn the scale ON")
    input("Please turn the scale ON and press Enter to scan again...")

    devices_on = await scan_devices()
    print(f"Found {len(devices_on)} devices with scale ON.\n")

    # 1번에는 없고 3번에는 있는 장치 목록
    new_devices = {addr: info for addr, info in devices_on.items() if addr not in devices_off}

    if new_devices:
        print("New devices detected (likely your scale):")
        for addr, info in new_devices.items():
            print(f"Name: {info['name']}, Address: {addr}, RSSI: {info['rssi']}")
    else:
        print("No new devices detected.")

asyncio.run(main())
