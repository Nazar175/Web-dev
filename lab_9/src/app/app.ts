import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Sensor } from './sensor';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  sensors: Sensor[] = [
    { id: 1, name: 'Сенсор Центр', district: 'Галицький', noiseLevel: 72, status: 'active' },
    { id: 2, name: 'Сенсор Сихів', district: 'Сихівський', noiseLevel: 58, status: 'active' },
    { id: 3, name: 'Сенсор Левандівка', district: 'Залізничний', noiseLevel: 45, status: 'inactive' }
  ];

  newName = '';
  newDistrict = '';
  newNoiseLevel: number | null = null;

  addSensor(): void {
    const name = this.newName.trim();
    const district = this.newDistrict.trim();
    if (!name || !district || this.newNoiseLevel === null || this.newNoiseLevel < 0) return;

    const nextId = this.sensors.length
      ? Math.max(...this.sensors.map(sensor => sensor.id)) + 1
      : 1;

    this.sensors.push({
      id: nextId, name, district,
      noiseLevel: this.newNoiseLevel,
      status: 'active'
    });

    this.newName = '';
    this.newDistrict = '';
    this.newNoiseLevel = null;
  }

  deleteSensor(id: number): void {
    this.sensors = this.sensors.filter(sensor => sensor.id !== id);
  }

  toggleStatus(id: number): void {
    const sensor = this.sensors.find(item => item.id === id);
    if (sensor) sensor.status = sensor.status === 'active' ? 'inactive' : 'active';
  }
}
