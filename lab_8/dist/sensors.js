"use strict";
function renderSensors(sensors) {
    const container = document.querySelector("#sensors");
    if (!container) {
        return;
    }
    container.innerHTML = "";
    if (sensors.length === 0) {
        container.textContent = "У API поки немає сенсорів.";
        return;
    }
    sensors.forEach((sensor) => {
        const card = document.createElement("div");
        card.className = `sensor-card sensor-card--${sensor.status}`;
        card.innerHTML = `
      <h3>${sensor.name}</h3>
      <p>Район: ${sensor.district}</p>
      <p>Рівень шуму: ${sensor.noiseLevel} дБ</p>
      <p>Статус: ${sensor.status}</p>
    `;
        container.appendChild(card);
    });
}

async function loadSensors() {
    try {
        const response = await fetch("https://6ad21bc366cd28aed82da2aa.mockapi.io/api/v1/sensors");
        if (!response.ok) {
            throw new Error("Не вдалося завантажити сенсори");
        }
        const sensors = await response.json();
        renderSensors(sensors);
    }
    catch (error) {
        console.error("Помилка:", error);
        const container = document.querySelector("#sensors");
        if (container) {
            container.textContent = "Не вдалося завантажити дані сенсорів. Перевірте адресу API.";
        }
    }
}
loadSensors();
