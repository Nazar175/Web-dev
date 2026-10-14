const noiseLevels = [
  42, 55, 61, 78, 83, 67, 49, 72, 91, 58, 64, 76,
  53, 47, 88, 69, 74, 82, 95, 51, 71, -1, 85, 63,
  79, 39, 141, 86
];

const warningLevel = 70;
const criticalLevel = 85;
const minValidLevel = 30;
const maxValidLevel = 130;

function isValidLevel(level, min, max) {
  return Number.isFinite(level) && level >= min && level <= max;
}

const statusLabel = value => `Рівень: ${value} dB`;

const isAbove = (value, threshold) => value > threshold;

const classifyLevel = function (level, warning, critical) {
  if (level <= warning) return "Без перевищення";
  if (level <= critical) return "Попередження";
  return "Критичні";
};

function calculateStatistics(data, min, max) {
  let validCount = 0;
  let invalidCount = 0;
  let sum = 0;
  let minimum = null;
  let maximum = null;
  const invalidRecords = [];

  for (const level of data) {
    if (!isValidLevel(level, min, max)) {
      invalidCount++;
      continue;
    }

    validCount++;
    sum += level;
    if (minimum === null || level < minimum) minimum = level;
    if (maximum === null || level > maximum) maximum = level;
  }

  for (let i = 0; i < data.length; i++) {
    if (!isValidLevel(data[i], min, max)) {
      invalidRecords.push({ position: i + 1, value: data[i] });
    }
  }

  return {
    total: data.length,
    validCount,
    invalidCount,
    average: validCount > 0 ? sum / validCount : null,
    minimum,
    maximum,
    invalidRecords
  };
}

const countByCategory = function (data, warning, critical, min, max) {
  const counts = { "Без перевищення": 0, "Попередження": 0, "Критичні": 0 };

  for (const level of data) {
    if (!isValidLevel(level, min, max)) continue;
    counts[classifyLevel(level, warning, critical)]++;
  }
  return counts;
};

function summarizeCategories(data, classifier, warning, critical, min, max) {
  const result = { "Без перевищення": 0, "Попередження": 0, "Критичні": 0 };
  for (const level of data) {
    if (!isValidLevel(level, min, max)) continue;
    result[classifier(level, warning, critical)]++;
  }
  return result;
}

function findFirstCritical(data, critical, min, max) {
  for (let i = 0; i < data.length; i++) {
    const level = data[i];
    if (!isValidLevel(level, min, max)) continue;
    if (level > critical) {
      return { value: level, position: i + 1 };
    }
  }
  return null;
}

function findRecovery(data, warning, critical, min, max) {
  const firstCritical = findFirstCritical(data, critical, min, max);
  if (firstCritical === null) return null;

  let i = firstCritical.position;
  let safeInARow = 0;
  let recoveryPosition = null;

  while (i < data.length) {
    const level = data[i];
    if (isValidLevel(level, min, max) && level <= warning) {
      safeInARow++;
      if (safeInARow === 3) {
        recoveryPosition = i + 1;
        break;
      }
    } else {
      safeInARow = 0;
    }
    i++;
  }
  return recoveryPosition;
}

function findFirstValid(data, min, max) {
  if (data.length === 0) return null;

  let i = 0;
  do {
    if (isValidLevel(data[i], min, max)) {
      return { value: data[i], position: i + 1 };
    }
    i++;
  } while (i < data.length);

  return null;
}

function analyzeMeasurements(data, warning, critical, min, max) {
  const statistics = calculateStatistics(data, min, max);
  const categories = summarizeCategories(data, classifyLevel, warning, critical, min, max);
  const firstCritical = findFirstCritical(data, critical, min, max);
  const recoveryPosition = findRecovery(data, warning, critical, min, max);
  const firstValid = findFirstValid(data, min, max);

  return { statistics, categories, firstCritical, recoveryPosition, firstValid };
}

function printReport(data, warning, critical, min, max) {
  const report = analyzeMeasurements(data, warning, critical, min, max);
  const stats = report.statistics;

  console.group("Акустична варта — звіт моніторингу");
  console.log(`Пороги: попередження > ${warning} dB; критичний рівень > ${critical} dB`);
  console.log(`Усього вимірювань: ${stats.total}`);
  console.log(`Коректних: ${stats.validCount}`);
  console.log(`Некоректних: ${stats.invalidCount}`);
  console.table(Object.entries(report.categories).map(([category, count]) => ({ category, count })));
  console.log(`Середній рівень: ${stats.average === null ? "не обчислюється" : `${stats.average.toFixed(2)} dB`}`);
  console.log(`Мінімальний рівень: ${stats.minimum === null ? "не знайдено" : `${stats.minimum} dB`}`);
  console.log(`Максимальний рівень: ${stats.maximum === null ? "не знайдено" : `${stats.maximum} dB`}`);

  if (report.firstCritical) {
    console.warn(`Перше критичне вимірювання: ${report.firstCritical.value} dB, позиція ${report.firstCritical.position}`);
  } else {
    console.log("Критичних вимірювань не знайдено.");
  }

  console.log(`Відновлення — три безпечні вимірювання поспіль: ${report.recoveryPosition === null ? "не знайдено" : `позиція ${report.recoveryPosition}`}`);
  console.log(`Поріг ${warning} dB перевищено у ${report.categories["Попередження"] + report.categories["Критичні"]} вимірюваннях.`);

  if (stats.invalidRecords.length > 0) {
    console.error("Некоректні записи вхідних даних:");
    console.table(stats.invalidRecords);
  }

  if (report.categories["Критичні"] > 0 && report.recoveryPosition === null) {
    console.log(`Висновок: зафіксовано ${report.categories["Критичні"]} критичні вимірювання; після першого з них стійкого відновлення не виявлено.`);
  } else if (report.categories["Критичні"] > 0) {
    console.log(`Висновок: зафіксовано ${report.categories["Критичні"]} критичні вимірювання; серію з трьох безпечних показників виявлено на позиції ${report.recoveryPosition}.`);
  } else {
    console.log("Висновок: критичних вимірювань не зафіксовано.");
  }
  console.groupEnd();
  return report;
}

printReport(noiseLevels, warningLevel, criticalLevel, minValidLevel, maxValidLevel);

console.group("Перевірка тестових наборів");
console.log("Порожній масив:", analyzeMeasurements([], warningLevel, criticalLevel, minValidLevel, maxValidLevel));
console.log("Лише некоректні значення:", analyzeMeasurements([-1, 141], warningLevel, criticalLevel, minValidLevel, maxValidLevel));
console.log("Перевірка меж 70, 85 і 86:", analyzeMeasurements([70, 85, 86], warningLevel, criticalLevel, minValidLevel, maxValidLevel));
console.log("Серія безпечних вимірювань переривається, а потім відновлюється:", analyzeMeasurements([90, 60, 61, 80, 60, 62, 63], warningLevel, criticalLevel, minValidLevel, maxValidLevel));
console.log(statusLabel(54));
console.log("Чи перевищено 70 dB?", isAbove(74, warningLevel));
console.log("Категорії через Function Expression callback:", countByCategory(noiseLevels, warningLevel, criticalLevel, minValidLevel, maxValidLevel));
console.groupEnd();
