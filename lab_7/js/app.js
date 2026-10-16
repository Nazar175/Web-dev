const API_URL = "https://6ad21bc366cd28aed82da2aa.mockapi.io/api/v1/sensors";

const sensorsList = document.querySelector("#sensors-list");

function renderSensors(sensors) {
  sensorsList.replaceChildren();

  if (sensors.length === 0) {
    const message = document.createElement("p");
    message.classList.add("sensors-message");
    message.textContent = "У API поки немає сенсорів.";
    sensorsList.append(message);
    return;
  }

  sensors.forEach((sensor) => {
    const card = document.createElement("article");
    card.classList.add("sensor-card", `sensor-card--${sensor.status}`);

    const title = document.createElement("h3");
    title.textContent = sensor.name;

    const id = document.createElement("p");
    id.textContent = `ID: ${sensor.id}`;

    const district = document.createElement("p");
    district.textContent = `Район: ${sensor.district}`;

    const level = document.createElement("p");
    level.textContent = `Рівень шуму: ${sensor.noiseLevel} дБ`;

    const status = document.createElement("p");
    status.textContent = `Статус: ${sensor.status}`;

    card.append(title, id, district, level, status);
    sensorsList.append(card);
  });
}

async function loadSensors() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP-помилка: ${response.status}`);
    }

    const sensors = await response.json();
    renderSensors(sensors);
  } catch (error) {
    console.error("Не вдалося завантажити сенсори:", error);
    sensorsList.replaceChildren();

    const message = document.createElement("p");
    message.classList.add("sensors-message", "sensors-message--error");
    message.textContent = "Не вдалося завантажити дані. Перевірте адресу API_URL та підключення до мережі.";
    sensorsList.append(message);
  }
}

loadSensors();
