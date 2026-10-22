#!/usr/bin/env node
// prebuild/predev: tsc -b импортирует src/data/fx-rate.json и projects-status.json, а они в .gitignore
// (их пишут fetch-cbr-rate.cjs и check-projects.cjs в build:static). На чистой машине (CI, свежий клон)
// создаём безопасные значения по умолчанию. Существующие файлы НЕ перезаписываются.
const fs = require('fs');
const path = require('path');
const { FALLBACK_FX } = require('./lib/fx.js');

const dataDir = path.join(__dirname, '..', 'src', 'data');
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const defaults = {
  'fx-rate.json': FALLBACK_FX, // резервный курс ЦБ
  'projects-status.json': {}, // нет статуса → проект считается доступным (см. src/data/projects.ts)
};

for (const [name, value] of Object.entries(defaults)) {
  const file = path.join(dataDir, name);
  if (fs.existsSync(file)) continue;
  writeJson(file, value);
  console.log(`✓ src/data/${name} не было — создан со значениями по умолчанию`);
}

// Лёгкий индекс посадочных услуг (slug → h1 по языкам + кейсы) для ссылок со /services и кейсов:
// полный services-landing.json (~23 КБ gzip) нужен только самой посадочной. Пересоздаётся всегда.
const landings = JSON.parse(fs.readFileSync(path.join(dataDir, 'services-landing.json'), 'utf8'));
const index = Object.fromEntries(Object.entries(landings).map(([slug, l]) => [slug, {
  relatedProjects: l.relatedProjects,
  h1: { ru: l.ru.h1, de: l.de.h1, en: l.en.h1 },
}]));
writeJson(path.join(dataDir, 'services-landing-index.json'), index);
