import { NoiseSensor } from './models/NoiseSensor.js';
import { NoiseMeasurement } from './models/NoiseMeasurement.js';
import { MobileNoiseSensor } from './models/MobileNoiseSensor.js';
import { MonitoringSystem } from './services/MonitoringSystem.js';

const sensorsData = [
  { id: 'NS-01', district: 'Галицький', location: 'просп. Свободи', noiseLevel: 58 },
  { id: 'NS-02', district: 'Франківський', location: 'вул. Наукова', noiseLevel: 74 },
  { id: 'NS-03', district: 'Шевченківський', location: 'просп. Чорновола', noiseLevel: 83 },
];

const sensors = sensorsData.map(data => NoiseSensor.fromObject(data));
const monitoringSystem = new MonitoringSystem();
sensors.forEach(sensor => monitoringSystem.addSensor(sensor));

const sensorList = document.querySelector('#sensor-list');
const districtFilter = document.querySelector('#district-filter');
const sensorSearch = document.querySelector('#sensor-search');
const sensorStats = document.querySelector('#sensor-stats');
const criticalSummary = document.querySelector('#critical-summary');

const statusNames = {
  normal: 'У нормі',
  warning: 'Попередження',
  critical: 'Критичний рівень',
};

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function renderSensorCard(sensor) {
  const status = sensor.getStatus();
  const card = createElement('article', `sensor-card sensor-card--${status}`);
  const top = createElement('div', 'sensor-card__top');
  top.append(createElement('span', 'sensor-card__id', sensor.id));
  top.append(createElement('span', `status status--${status}`, statusNames[status]));
  card.append(top);
  card.append(createElement('h3', 'sensor-card__district', sensor.district));
  card.append(createElement('p', 'sensor-card__location', sensor.location));

  const level = createElement('p', 'sensor-card__level');
  level.append(createElement('strong', '', `${sensor.noiseLevel} dB`));
  level.append(createElement('span', '', 'Поточний рівень шуму'));
  card.append(level);
  card.append(createElement('p', 'sensor-card__history', `Вимірювань в історії: ${sensor.measurements.length}`));

  const updateButton = createElement('button', 'button button--small', 'Додати +5 dB');
  updateButton.type = 'button';
  updateButton.addEventListener('click', () => {
    const nextLevel = Math.min(sensor.noiseLevel + 5, 200);
    sensor.updateNoiseLevel(nextLevel);
    renderDashboard();
    console.info(`${sensor.id}: новий рівень ${sensor.noiseLevel} dB; картку оновлено.`);
  });
  card.append(updateButton);
  return card;
}

function renderDashboard() {
  const searchValue = sensorSearch.value.trim().toLowerCase();
  const districtValue = districtFilter.value;
  let visibleSensors = monitoringSystem.sensors;

  if (districtValue) {
    visibleSensors = monitoringSystem.getSensorsByDistrict(districtValue);
  }
  if (searchValue) {
    visibleSensors = visibleSensors.filter(sensor =>
      sensor.id.toLowerCase().includes(searchValue) ||
      sensor.location.toLowerCase().includes(searchValue) ||
      sensor.district.toLowerCase().includes(searchValue)
    );
  }

  sensorList.replaceChildren();
  if (visibleSensors.length === 0) {
    sensorList.append(createElement('p', 'empty-state', 'Датчиків за вашим запитом не знайдено.'));
  } else {
    visibleSensors.forEach(sensor => sensorList.append(renderSensorCard(sensor)));
  }

  const average = monitoringSystem.getAverageNoiseLevel();
  const criticalSensors = monitoringSystem.getCriticalSensors();
  sensorStats.replaceChildren();
  [
    ['Датчиків у системі', String(monitoringSystem.sensors.length)],
    ['Середній рівень', average === null ? 'Немає даних' : `${average} dB`],
    ['Критичних датчиків', String(criticalSensors.length)],
  ].forEach(([label, value]) => {
    const item = createElement('article', 'sensor-stat');
    item.append(createElement('span', '', label));
    item.append(createElement('strong', '', value));
    sensorStats.append(item);
  });

  criticalSummary.textContent = criticalSensors.length
    ? `Потрібна увага: ${criticalSensors.map(sensor => sensor.id).join(', ')}.`
    : 'Зараз немає датчиків із критичним рівнем шуму.';
}

function fillDistrictFilter() {
  const districts = [...new Set(monitoringSystem.sensors.map(sensor => sensor.district))];
  districts.forEach(district => {
    const option = document.createElement('option');
    option.value = district;
    option.textContent = district;
    districtFilter.append(option);
  });
}

fillDistrictFilter();
districtFilter.addEventListener('change', renderDashboard);
sensorSearch.addEventListener('input', renderDashboard);
renderDashboard();

const demoSensor = monitoringSystem.findSensorById('NS-01');
const secondDemoSensor = new NoiseSensor('TEST-01', 'Тестовий', 'вул. Прикладна', 40);
const mobileDemoSensor = new MobileNoiseSensor('MOB-01', 'Тестовий', 'мобільна точка', 48, 15);
const demoMeasurement = new NoiseMeasurement(62);
secondDemoSensor.addMeasurement(demoMeasurement);

console.group('Акустична варта — об’єктна модель');
console.log('Усі сенсори системи:', monitoringSystem.sensors);
console.log('Пошук NS-02:', monitoringSystem.findSensorById('NS-02'));
console.log('Датчики Франківського району:', monitoringSystem.getSensorsByDistrict('Франківський'));
console.log('Критичні датчики:', monitoringSystem.getCriticalSensors());
console.log('Середній рівень шуму:', monitoringSystem.getAverageNoiseLevel(), 'dB');
console.log('Два екземпляри використовують спільний метод getStatus:', demoSensor.getStatus === secondDemoSensor.getStatus);
console.log('noiseLevel — власна властивість:', Object.hasOwn(demoSensor, 'noiseLevel'));
console.log('getStatus — власна властивість:', Object.hasOwn(demoSensor, 'getStatus'));
console.log('Історія вимірювань окремого датчика:', secondDemoSensor.measurements);
console.log('Мобільний датчик успадковує NoiseSensor:', mobileDemoSensor instanceof NoiseSensor);
console.log('Мобільному датчику потрібна зарядка:', mobileDemoSensor.needsCharging());
console.groupEnd();
