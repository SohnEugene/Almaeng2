# track_char.py
"""
Usage:
  1) Put your device address in .env as GOTOBAKE_ADDRESS or HOTO_ADDRESS (script also checks TARGET_ADDRESS env).
  2) Run: python track_char.py
     - You will be prompted for:
         * device address (press Enter to use env TARGET)
         * characteristic UUID to monitor (required)
         * csv filename (optional, default: char_log.csv)
  3) If characteristic supports notify -> script subscribes and logs notifications.
     Otherwise -> script polls read() periodically (default 0.5s).
  4) Stop with Ctrl+C.

Notes:
  - Requires bleak and python-dotenv:
      pip install bleak python-dotenv
  - Works on Linux/Windows/macOS with bleak backend; macOS may have limited metadata support.
"""

import asyncio
import csv
import os
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from bleak import BleakClient, BleakScanner
from bleak.backends.characteristic import BleakGATTCharacteristic

# --- Load .env from repo root (two levels up from this file? adjust if needed) ---
dotenv_path = Path(__file__).resolve().parent.parent / ".env"
if dotenv_path.exists():
    load_dotenv(dotenv_path)
else:
    # also try same folder .env as fallback
    alt = Path(__file__).resolve().parent / ".env"
    if alt.exists():
        load_dotenv(alt)
    # else continue; user can input address manually

GOTOBAKE_ADDRESS = os.getenv("GOTOBAKE_ADDRESS")
HOTO_ADDRESS = os.getenv("HOTO_ADDRESS")
LFC_ADDRESS = os.getenv("LFC_ADDRESS")

ENV_TARGET = GOTOBAKE_ADDRESS
# Helper parse attempts for raw bytes
def interpretations_from_bytes(b: bytes):
    """Return several interpretations of raw bytes to help identify format."""
    res = {}
    res["len"] = len(b)
    res["hex"] = b.hex()
    # signed/unsigned ints little-endian for 1..8 bytes if available
    for size in (1, 2, 4, 8):
        if len(b) >= size:
            try:
                val_u = int.from_bytes(b[:size], byteorder="little", signed=False)
                val_s = int.from_bytes(b[:size], byteorder="little", signed=True)
                res[f"u{size}le"] = val_u
                res[f"s{size}le"] = val_s
            except Exception:
                pass
            try:
                val_u_be = int.from_bytes(b[:size], byteorder="big", signed=False)
                val_s_be = int.from_bytes(b[:size], byteorder="big", signed=True)
                res[f"u{size}be"] = val_u_be
                res[f"s{size}be"] = val_s_be
            except Exception:
                pass
    # float32/float64 attempts (if length >=4/8)
    if len(b) >= 4:
        import struct
        try:
            res["f32_le"] = struct.unpack("<f", b[:4])[0]
            res["f32_be"] = struct.unpack(">f", b[:4])[0]
        except Exception:
            pass
    if len(b) >= 8:
        import struct
        try:
            res["f64_le"] = struct.unpack("<d", b[:8])[0]
            res["f64_be"] = struct.unpack(">d", b[:8])[0]
        except Exception:
            pass
    return res

async def choose_device(provided_address: Optional[str] = None, timeout: float = 10.0):
    """If provided_address given, try to find it; otherwise let user pick from scanned devices."""
    if provided_address:
        print(f"Looking for device with address: {provided_address} (timeout {timeout}s)...")
        dev = await BleakScanner.find_device_by_address(provided_address, timeout=timeout)
        if dev:
            print(f"Found: {dev.name} ({dev.address})")
        else:
            print("Not found by address.")
        return dev

    print("No address provided. Scanning for devices (short list)...")
    devices = await BleakScanner.discover(timeout=5.0)
    if not devices:
        print("No devices found.")
        return None
    for i, d in enumerate(devices):
        print(f"[{i}] {d.name or 'Unknown'} - {d.address}")
    sel = input("Choose device index (or 'q' to quit): ").strip()
    if sel.lower() == "q":
        return None
    try:
        idx = int(sel)
        return devices[idx]
    except Exception:
        print("Invalid selection.")
        return None

async def monitor_characteristic(address: str, char_uuid: str, csv_file: str, poll_interval: float = 0.5):
    """
    Connect, determine if notify supported. If notify -> subscribe.
    Otherwise poll read() every poll_interval seconds.
    Log (timestamp_iso, raw_hex, interpretations...) to CSV.
    """
    print(f"Connecting to {address} ...")
    device = await BleakScanner.find_device_by_address(address, timeout=10.0)
    if not device:
        print("Device not found by address.")
        return

    async with BleakClient(device, timeout=30.0) as client:
        try:
            # ensure services loaded
            services = await client.get_services()
        except Exception:
            # fallback to client.services if available
            services = getattr(client, "services", None)

        print("Connected:", client.is_connected)
        # find characteristic object (if possible)
        target_char: Optional[BleakGATTCharacteristic] = None
        for srv in services:
            for ch in srv.characteristics:
                if ch.uuid.lower() == char_uuid.lower():
                    target_char = ch
                    break
            if target_char:
                break

        if not target_char:
            print("Characteristic UUID not found on device. Available characteristics:")
            for srv in services:
                for ch in srv.characteristics:
                    print(f"  - {ch.uuid} (props: {ch.properties})")
            return

        print(f"Found characteristic {target_char.uuid} with props: {target_char.properties}")

        # open CSV
        csv_exists = Path(csv_file).exists()
        with open(csv_file, "a", newline="") as f:
            writer = csv.writer(f)
            if not csv_exists:
                # header
                writer.writerow(["timestamp_iso", "timestamp_ms", "hex", "len", "interpretation"])

            async def handle_notify(_: int, data: bytearray):
                ts_iso = datetime.utcnow().isoformat()
                ts_ms = int(time.time() * 1000)
                b = bytes(data)
                interp = interpretations_from_bytes(b)
                # string version of interpretation small summary
                interp_summary = "; ".join(f"{k}={v}" for k, v in list(interp.items())[:6])
                print(f"[{ts_iso}] RAW hex={b.hex()} len={len(b)} -> {interp_summary}")
                writer.writerow([ts_iso, ts_ms, b.hex(), len(b), interp_summary])
                f.flush()

            # If notify supported -> subscribe
            if "notify" in target_char.properties or "indicate" in target_char.properties:
                print("Characteristic supports notify -> starting notifications.")
                await client.start_notify(target_char.uuid, handle_notify)
                print("Notifications started. Press Ctrl+C to stop.")
                try:
                    while True:
                        await asyncio.sleep(1.0)
                except asyncio.CancelledError:
                    pass
                finally:
                    await client.stop_notify(target_char.uuid)
            else:
                # fallback: poll via read_gatt_char
                print("Notify not supported. Polling read() every", poll_interval, "seconds. Press Ctrl+C to stop.")
                try:
                    while True:
                        data = await client.read_gatt_char(target_char.uuid)
                        ts_iso = datetime.utcnow().isoformat()
                        ts_ms = int(time.time() * 1000)
                        b = bytes(data)
                        interp = interpretations_from_bytes(b)
                        interp_summary = "; ".join(f"{k}={v}" for k, v in list(interp.items())[:6])
                        print(f"[{ts_iso}] READ hex={b.hex()} len={len(b)} -> {interp_summary}")
                        writer.writerow([ts_iso, ts_ms, b.hex(), len(b), interp_summary])
                        f.flush()
                        await asyncio.sleep(poll_interval)
                except asyncio.CancelledError:
                    pass

async def main_cli():
    print("=== BLE characteristic tracker ===")
    env = ENV_TARGET
    if env:
        print(f"Found address in env: {env}")
    addr = input(f"Device address (Enter to use env {env}): ").strip() or env
    if not addr:
        print("No address provided. Exiting.")
        return

    # --- Connect and list available characteristics ---
    print("Connecting to device to enumerate characteristics...")
    device = await BleakScanner.find_device_by_address(addr, timeout=10.0)
    if not device:
        print("Device not found. Exiting.")
        return

    async with BleakClient(device) as client:
        try:
            services = await client.get_services()
        except Exception:
            services = getattr(client, "services", None)
        print("Connected:", client.is_connected)
        print("Available characteristics on device:")
        for srv in services:
            print(f"[Service] {srv.uuid}")
            for ch in srv.characteristics:
                print(f"  - {ch.uuid} (props: {ch.properties})")

    # --- Ask user for characteristic UUID ---
    char_uuid = input("Characteristic UUID to monitor (choose from above): ").strip()
    if not char_uuid:
        print("Characteristic UUID is required. Exiting.")
        return

    csv_file = input("CSV file to append (default: char_log.csv): ").strip() or "char_log.csv"
    poll = input("Poll interval in seconds if no notify (default 0.5): ").strip()
    try:
        poll_interval = float(poll) if poll else 0.5
    except:
        poll_interval = 0.5

    try:
        await monitor_characteristic(addr, char_uuid, csv_file, poll_interval)
    except KeyboardInterrupt:
        print("\nInterrupted by user. Exiting.")
    except Exception as e:
        print("Error:", e)


if __name__ == "__main__":
    asyncio.run(main_cli())
