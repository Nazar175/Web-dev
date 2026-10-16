export class NoiseMeasurement {
  constructor(value, measuredAt = new Date()) {
    if (!Number.isFinite(value) || value < 0 || value > 200) {
      throw new Error('Рівень шуму має бути числом від 0 до 200 dB.');
    }

    this.value = value;
    this.measuredAt = measuredAt instanceof Date ? measuredAt : new Date(measuredAt);
  }

  isValid() {
    return Number.isFinite(this.value) && this.value >= 0 && this.value <= 200;
  }

  toString() {
    return `${this.value} dB — ${this.measuredAt.toLocaleString('uk-UA')}`;
  }
}
