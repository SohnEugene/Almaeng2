"""
scan_advertising.py

Scan nearby BLE advertisements and *dynamically* inspect attributes of the
BLEDevice and AdvertisementData objects before accessing them.

Usage:
    python scan_advertising.py [timeout_seconds]

Dependencies:
    pip install bleak

Behavior:
    - For each detected advertisement, it lists non-private attributes available
      on both the device and the advertisement_data object.
    - It then prints the values for those attributes (safe-access).
"""

import asyncio
import sys
from bleak import BleakScanner

# helper: return visible (non-private, non-callable) attribute names for an object
def visible_attrs(obj):
    names = []
    for name in dir(obj):
        if name.startswith("_"):
            continue
        try:
            val = getattr(obj, name)
        except Exception:
            continue
        # skip methods/callables
        if callable(val):
            continue
        names.append(name)
    return names

# helper: safe-get attribute value and format it (shorten long bytes/dicts)
def safe_get(obj, name):
    try:
        val = getattr(obj, name)
    except Exception:
        return "<error>"
    # pretty formatting for bytes / dicts / lists
    if isinstance(val, (bytes, bytearray)):
        # show hex prefix and length
        b = bytes(val)
        return f"bytes(len={len(b)}) 0x{b.hex()[:64]}{'...' if len(b.hex())>64 else ''}"
    if isinstance(val, dict):
        # limit printing
        items = list(val.items())[:5]
        return f"dict(len={len(val)}) {items}{'...' if len(val)>5 else ''}"
    if isinstance(val, (list, tuple, set)):
        items = list(val)[:8]
        return f"{type(val).__name__}(len={len(val)}) {items}{'...' if len(val)>8 else ''}"
    # simple scalar
    return repr(val)

async def scan_with_advertising_info(timeout: float = 5.0):
    print(f"🔍 Scanning for BLE advertisements ({timeout} seconds)...\n")
    found_devices = {}

    def detection_callback(device, advertisement_data):
        """
        Called whenever BleakScanner sees an advertisement.
        We dynamically inspect attributes on `device` and `advertisement_data`
        and print only the available ones.
        """
        # store latest adv object for the address
        found_devices[device.address] = advertisement_data

        print(f"\n[Advertising] {getattr(device, 'name', None) or 'Unknown'} ({device.address})")

        # Inspect both objects
        dev_attrs = visible_attrs(device)
        adv_attrs = visible_attrs(advertisement_data)

        # Print discovered attribute names (compact)
        print("  Device attributes:", ", ".join(dev_attrs) if dev_attrs else "<none>")
        print("  AdvertisementData attributes:", ", ".join(adv_attrs) if adv_attrs else "<none>")

        # Now print values for some of the most useful attributes if present.
        # We'll iterate through adv_attrs and device attrs and print safe values.
        print("  -> Values (advertisement_data):")
        for name in adv_attrs:
            val = safe_get(advertisement_data, name)
            print(f"     - {name}: {val}")

        print("  -> Values (device):")
        for name in dev_attrs:
            val = safe_get(device, name)
            print(f"     - {name}: {val}")

    scanner = BleakScanner(detection_callback)
    await scanner.start()
    await asyncio.sleep(timeout)
    await scanner.stop()
    print("\n✅ Scan complete.")
    print(f"Total devices found: {len(found_devices)}")

    # summary printout (only show a compact summary per address)
    if found_devices:
        print("\n--- Summary of detected devices ---")
        for addr, adv in found_devices.items():
            print(f"{addr}:")
            attrs = visible_attrs(adv)
            # print some likely-useful fields if present (service_uuids, manufacturer_data, service_data, local_name, tx_power, rssi)
            for field in ("local_name", "service_uuids", "manufacturer_data", "service_data", "tx_power", "rssi"):
                if field in attrs:
                    print(f"  {field}: {safe_get(adv, field)}")
    else:
        print("No devices found.")

    return found_devices


async def main():
    timeout = 5.0
    if len(sys.argv) > 1:
        try:
            timeout = float(sys.argv[1])
        except ValueError:
            print("Invalid timeout, using default 5.0s.")
    await scan_with_advertising_info(timeout)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nInterrupted by user.")
