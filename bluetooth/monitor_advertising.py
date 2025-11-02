# monitor_advertising_full.py
import asyncio
from bleak import BleakScanner
from datetime import datetime
import os
from pathlib import Path
from dotenv import load_dotenv
import csv

# Load .env
dotenv_path = Path(__file__).resolve().parent.parent / ".env"
if dotenv_path.exists():
    load_dotenv(dotenv_path)
else:
    alt = Path(__file__).resolve().parent / ".env"
    if alt.exists():
        load_dotenv(alt)

GOTOBAKE_ADDRESS = os.getenv("GOTOBAKE_ADDRESS")
HOTO_ADDRESS = os.getenv("HOTO_ADDRESS")
TARGET_ADDRESS = GOTOBAKE_ADDRESS

CSV_FILE = "ble_advertising_log.csv"

async def monitor_advertising(target_address: str, duration: float = 10.0):
    print(f"Monitoring advertising packets from {target_address} for {duration}s...")

    # CSV 초기화
    with open(CSV_FILE, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([
            "timestamp", "rssi", "local_name", "service_uuids", "service_data",
            "manufacturer_data", "tx_power", "solicited_service_uuids", "appearance"
        ])

    def detection_callback(device, advertisement_data):
        if device.address.lower() != target_address.lower():
            return

        ts = datetime.utcnow().isoformat()
        rssi = getattr(device, "rssi", getattr(advertisement_data, "rssi", None))
        local_name = getattr(advertisement_data, "local_name", None)
        service_uuids = getattr(advertisement_data, "service_uuids", None)
        service_data = {k: v.hex() for k, v in getattr(advertisement_data, "service_data", {}).items()} if getattr(advertisement_data, "service_data", None) else {}
        manufacturer_data = {k: v.hex() for k, v in getattr(advertisement_data, "manufacturer_data", {}).items()} if getattr(advertisement_data, "manufacturer_data", None) else {}
        tx_power = getattr(advertisement_data, "tx_power", None)
        solicited_service_uuids = getattr(advertisement_data, "solicited_service_uuids", None)
        appearance = getattr(advertisement_data, "appearance", None)

        print(f"[{ts}] RSSI: {rssi}, Local Name: {local_name}")
        print(f"Service UUIDs: {service_uuids}")
        print(f"Service Data: {service_data}")
        print(f"Manufacturer Data: {manufacturer_data}")
        print(f"TX Power: {tx_power}, Solicited UUIDs: {solicited_service_uuids}, Appearance: {appearance}")
        print("-" * 60)

        # CSV 기록
        with open(CSV_FILE, "a", newline="") as f:
            writer = csv.writer(f)
            writer.writerow([
                ts, rssi, local_name, service_uuids, service_data,
                manufacturer_data, tx_power, solicited_service_uuids, appearance
            ])


    scanner = BleakScanner(detection_callback)
    await scanner.start()
    try:
        await asyncio.sleep(duration)
    finally:
        await scanner.stop()
        print("Monitoring finished. CSV saved to", CSV_FILE)

if __name__ == "__main__":
    target_address = TARGET_ADDRESS
    if not target_address:
        print("No address provided. Exiting.")
    else:
        try:
            asyncio.run(monitor_advertising(target_address, duration=30.0))
        except KeyboardInterrupt:
            print("Stopped by user.")
