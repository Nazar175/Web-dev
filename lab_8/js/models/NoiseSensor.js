import { NoiseMeasurement } from './NoiseMeasurement.js';

export const NOISE_LIMITS = Object.freeze({
  normalMax: 55,
  warningMax: 70,
});

export class NoiseSensor {
  constructor(id, district, location, noiseLevel) {
    if (!id || !district || !location) {
      throw new Error('Для датчика потрібно вказати ID, район і адресу.');
    }
    if (!NoiseSensor.isValidNoiseLevel(noiseLevel)) {
      throw new Error(`Некоректний рівень шуму для датчика ${id}.`);
    }

    this.id = id;
    this.district = district;
    this.location = location;
    this.noiseLevel = noiseLevel;
    this.measurements = [];
    this.addMeasurement(new NoiseMeasurement(noiseLevel));
  }

  getStatus() {
    if (this.noiseLevel <= NOISE_LIMITS.normalMax) return 'normal';
    if (this.noiseLevel <= NOISE_LIMITS.warningMax) return 'warning';
    return 'critical';
  }

  updateNoiseLevel(value) {
    if (!NoiseSensor.isValidNoiseLevel(value)) {
      throw new Error('Рівень шуму має бути числом від 0 до 200 dB.');
    }
    this.addMeasurement(new NoiseMeasurement(value));
    return this.noiseLevel;
  }

  addMeasurement(measurement) {
    if (!(measurement instanceof NoiseMeasurement)) {
      throw new Error('Очікується об’єкт NoiseMeasurement.');
    }
    this.measurements.push(measurement);
    this.noiseLevel = measurement.value;
    return measurement;
  }

  static isValidNoiseLevel(value) {
    return Number.isFinite(value) && value >= 0 && value <= 200;
  }

  static fromObject(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Для створення датчика потрібен об’єкт із даними.');
    }
    return new NoiseSensor(data.id, data.district, data.location, data.noiseLevel);
  }
}
