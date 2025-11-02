// src/hooks/scale.js
const SCALE_SERVICE_UUID = '0000fff1-0000-1000-8000-00805f9b34fb';
const SCALE_CHAR_UUID = '58CEF04B-022C-13A8-C1C3-3B4D507F6BBE';

export async function connectScale(updateWeight) {
  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [SCALE_SERVICE_UUID] }]
    });

    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(SCALE_SERVICE_UUID);
    const characteristic = await service.getCharacteristic(SCALE_CHAR_UUID);

    const handleValue = (value) => {
      const hexStr = Array.from(new Uint8Array(value.buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      const middleHex = hexStr.slice(16,28).replace(/^0+/, '');
      const weight = middleHex ? parseInt(middleHex, 16) : 0;
      updateWeight(weight);
    };

    if (characteristic.properties.notify) {
      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', e => {
        handleValue(e.target.value);
      });
    } else if (characteristic.properties.read) {
      setInterval(async () => {
        const value = await characteristic.readValue();
        handleValue(value);
      }, 500);
    } else {
      alert('Characteristic does not support read or notify.');
    }

  } catch (err) {
    console.error(err);
    alert('Error connecting to scale: ' + err);
  }
}
