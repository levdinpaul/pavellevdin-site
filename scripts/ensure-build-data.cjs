#!/usr/bin/env node
// prebuild: tsc -b импортирует src/data/fx-rate.json и projects-status.json, а они в .gitignore
// (их пишут fetch-cbr-rate.cjs и check-projects.cjs в build:static). На чистой машине (CI, свежий клон)
// создаём безопасные значения по умолчанию. Существующие файлы НЕ перезаписываются.
const fs = require('fs');
const path = require('path');
const { FALLBACK_FX } = require('./lib/fx.js');

const dataDir = path.join(__dirname, '..', 'src', 'data');
const defaults = {
  'fx-rate.json': FALLBACK_FX, // резервный курс ЦБ
  'projects-status.json': {}, // нет статуса → проект считается доступным (см. src/data/projects.ts)
};

for (const [name, value] of Object.entries(defaults)) {
  const file = path.join(dataDir, name);
  if (fs.existsSync(file)) continue;
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '
');
  console.log(`✓ src/data/${name} не было — создан со значениями по умолчанию`);
}
