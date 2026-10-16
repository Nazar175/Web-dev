import { NoiseSensor } from './NoiseSensor.js';

export class MobileNoiseSensor extends NoiseSensor {
  constructor(id, district, location, noiseLevel, batteryLevel = 100) {
    super(id, district, location, noiseLevel);
    if (!Number.isFinite(batteryLevel) || batteryLevel < 0 || batteryLevel > 100) {
      throw new Error('Рівень батареї має бути в діапазоні від 0 до 100%.');
    }
    this.batteryLevel = batteryLevel;
  }

  needsCharging() {
    return this.batteryLevel <= 20;
  }
}
