const sensors = [
  {
    id: "NS-01",
    district: "Галицький",
    location: "просп. Свободи, 1",
    noiseLevel: 52,
    status: "normal"
  },
  {
    id: "NS-02",
    district: "Франківський",
    location: "вул. Наукова, 10",
    noiseLevel: 68,
    status: "warning"
  },
  {
    id: "NS-03",
    district: "Шевченківський",
    location: "просп. Чорновола, 20",
    noiseLevel: 83,
    status: "critical"
  },
  {
    id: "NS-04",
    district: "Галицький",
    location: "вул. Городоцька, 15",
    noiseLevel: 79,
    status: "critical"
  }
];

const sensorList = document.querySelector(".sensor-list");
const districtFilter = document.querySelector("#district-filter");
const criticalFilter = document.querySelector("#critical-filter");

function createSensorCard(sensor) {
  const card = document.createElement("article");
  card.classList.add("sensor-card");
  card.classList.add(`sensor-card--${sensor.status}`);

  const title = document.createElement("h3");
  title.textContent = sensor.id;

  const district = document.createElement("p");
  district.textContent = `Район: ${sensor.district}`;

  const location = document.createElement("p");
  location.textContent = `Локація: ${sensor.location}`;

  const level = document.createElement("p");
  level.textContent = `Рівень шуму: ${sensor.noiseLevel} дБ`;

  const status = document.createElement("p");
  const statusNames = {
    normal: "У нормі",
    warning: "Попередження",
    critical: "Критичний"
  };
  status.textContent = `Статус: ${statusNames[sensor.status]}`;

  card.append(title, district, location, level, status);
  return card;
}

function renderSensors(sensorArray) {
  sensorList.replaceChildren();
  sensorArray.forEach((sensor) => {
    const card = createSensorCard(sensor);
    sensorList.append(card);
  });
}

function applyFilters() {
  const selectedDistrict = districtFilter.value;
  const criticalOnly = criticalFilter.checked;

  const filteredSensors = sensors.filter((sensor) => {
    const matchesDistrict =
      selectedDistrict === "all" || sensor.district === selectedDistrict;
    const matchesStatus = !criticalOnly || sensor.status === "critical";
    return matchesDistrict && matchesStatus;
  });

  renderSensors(filteredSensors);
}

districtFilter.addEventListener("change", applyFilters);
criticalFilter.addEventListener("change", applyFilters);

renderSensors(sensors);
