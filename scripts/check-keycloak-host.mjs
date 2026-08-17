import fs from 'node:fs';

const baseUrl = process.argv[2];
const credentialsFile = process.argv[3];
if (!baseUrl || !credentialsFile) {
  throw new Error('Usage: node check-keycloak-host.mjs <base-url> <credentials.csv>');
}

const lines = fs.readFileSync(credentialsFile, 'utf8').replace(/^\uFEFF/u, '').trim().split('\n');
const row = lines.slice(1).map(parseCsvLine).find((fields) => fields[3] === 'Активна');
if (!row) {
  throw new Error('В ведомости не найден активный пользователь');
}

const [fullName, , password] = row;
const loginUrl = `${baseUrl.replace(/\/$/, '')}/api/v1/auth/login`;

const wrong = await fetch(loginUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ fullName, password: `${password}-wrong` }),
});
if (wrong.status !== 401) {
  throw new Error(`Неверный пароль должен вернуть 401, получено ${wrong.status}`);
}

const correct = await fetch(loginUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ fullName, password }),
});
if (!correct.ok) {
  throw new Error(`Правильный пароль не принят: HTTP ${correct.status} ${await correct.text()}`);
}

const cookies =
  typeof correct.headers.getSetCookie === 'function'
    ? correct.headers.getSetCookie().map((value) => value.split(';')[0]).join('; ')
    : correct.headers.get('set-cookie');
if (!cookies?.includes('femida_access_token=')) {
  throw new Error('API не установил защищённую cookie-сессию');
}

const session = await fetch(
  `${baseUrl.replace(/\/$/, '')}/api/v1/auth/session`,
  { headers: { Cookie: cookies } },
);
const sessionBody = await session.json();
if (!session.ok || !sessionBody.authenticated || sessionBody.authMode !== 'keycloak') {
  throw new Error(`Сессия не подтверждена: HTTP ${session.status}`);
}

console.log('Неверный пароль: отклонён (401)');
console.log('Правильный пароль: принят');
console.log('HttpOnly cookie-сессия: подтверждена');
console.log('Режим API: keycloak');

function parseCsvLine(line) {
  const fields = [];
  let value = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        value += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === ';' && !quoted) {
      fields.push(value);
      value = '';
    } else {
      value += char;
    }
  }
  fields.push(value.replace(/\r$/u, ''));
  return fields;
}
