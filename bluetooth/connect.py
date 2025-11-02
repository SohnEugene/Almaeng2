import asyncio
from bleak import BleakClient, BleakScanner

# LFSc BLE 주소 (예시)
KC_ADDRESS = "87D73746-3FEC-15A4-37C8-B54190681AB8"
HOTO_ADDRESS = "D64066AB-1244-97CC-1413-83A4CEE2B7C9"
ADDRESS = HOTO_ADDRESS

async def scan_devices():
    print("Scanning for BLE devices...")
    devices = await BleakScanner.discover()
    for d in devices:
        name = getattr(d, 'name', 'Unknown')
        address = getattr(d, 'address', 'Unknown')
        rssi = getattr(d, 'rssi', 'N/A')
        details = getattr(d, 'details', {})
        print(f"Address: {address}, Name: {name}, RSSI: {rssi}, Details: {details}")
    return devices

async def connect_device(address):
    try:
        async with BleakClient(ADDRESS, timeout=60.0) as client:
            # is_connected는 property일 수 있으므로 호출하지 않고 접근
            connected = await client.is_connected()
            if connected:
                print(f"Connected to {ADDRESS}\n")
                
                services = await client.get_services()
                print("Services and characteristics:")
                for service in services:
                    print(f"Service UUID: {service.uuid}")
                    for char in service.characteristics:
                        props = ', '.join(char.properties)
                        print(f"  Characteristic UUID: {char.uuid}, Properties: {props}")
            else:
                print("Failed to connect")

    except Exception as e:
        print(f"Error connecting to {address}: {e}")

async def main():
    devices = await scan_devices()

    # LFSc 주소를 가진 장치가 있으면 연결 시도
    target = next((d for d in devices if getattr(d, 'address', '') == ADDRESS), None)
    if target:
        print(f"Found target device: {getattr(target, 'name', 'Unknown')} ({target.address})")
        await connect_device(target.address)
    else:
        print(f"Target device {ADDRESS} not found during scan.")

asyncio.run(main())
