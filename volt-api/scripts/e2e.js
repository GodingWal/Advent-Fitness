#!/usr/bin/env node
// E2E smoke test for volt-api. Assumes the server is running on http://localhost:3000
// (run `npm start` in another terminal after `npm run build`).
// Plain node, global fetch, no dependencies. Exits non-zero with a message on any failure.
const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000';

const EMAIL = 'member@volt.test';
const PASSWORD = 'Volt12345!';

function fail(step, detail) {
  console.error(`E2E FAILED at ${step}: ${detail}`);
  process.exit(1);
}

async function req(method, path, { token, body } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    fail(`${method} ${path}`, `fetch error: ${e.message} (is the server running on ${BASE}?)`);
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, data };
}

(async () => {
  // 1. login seed member
  const login = await req('POST', '/auth/login', { body: { email: EMAIL, password: PASSWORD } });
  if (login.status !== 200 || !login.data.accessToken) {
    fail('login', `status=${login.status} body=${JSON.stringify(login.data)}`);
  }
  const token = login.data.accessToken;
  console.log('ok: login');

  // 2. memberships
  const mems = await req('GET', '/v1/memberships', { token });
  const memberships = mems.data && mems.data.memberships;
  if (mems.status !== 200 || !Array.isArray(memberships) || memberships.length === 0) {
    fail('memberships', `status=${mems.status} body=${JSON.stringify(mems.data)}`);
  }
  const membershipId = memberships[0].id;
  const gymId = memberships[0].gym.id;
  console.log(`ok: memberships (${memberships.length})`);

  // 3. locations
  const locs = await req('GET', `/v1/gyms/${gymId}/locations`, { token });
  const locations = locs.data && locs.data.locations;
  if (locs.status !== 200 || !Array.isArray(locations) || locations.length === 0) {
    fail('locations', `status=${locs.status} body=${JSON.stringify(locs.data)}`);
  }
  const locationId = locations[0].id;
  console.log(`ok: locations (${locations.length})`);

  // 4. doors
  const doorsRes = await req('GET', `/v1/locations/${locationId}/doors`, { token });
  const doors = doorsRes.data && doorsRes.data.doors;
  if (doorsRes.status !== 200 || !Array.isArray(doors) || doors.length === 0) {
    fail('doors', `status=${doorsRes.status} body=${JSON.stringify(doorsRes.data)}`);
  }
  const frontDoor = doors.find((d) => d.name === 'front-entrance') || doors[0];
  console.log(`ok: doors (${doors.length}), using ${frontDoor.name}`);

  // 5. unlock front door (assert success:true)
  const unlock = await req('POST', `/v1/access/doors/${frontDoor.id}/unlock`, { token, body: {} });
  if (unlock.status !== 200 || unlock.data.success !== true) {
    fail('unlock', `status=${unlock.status} body=${JSON.stringify(unlock.data)}`);
  }
  console.log('ok: unlock success:true');

  // 6. history (assert newest result GRANTED)
  const hist = await req('GET', '/v1/access/history', { token });
  const events = hist.data && hist.data.events;
  if (hist.status !== 200 || !Array.isArray(events) || events.length === 0) {
    fail('history', `status=${hist.status} body=${JSON.stringify(hist.data)}`);
  }
  if (events[0].result !== 'GRANTED') {
    fail('history', `newest result=${JSON.stringify(events[0].result)} expected GRANTED`);
  }
  console.log('ok: history newest GRANTED');

  // 7. qr-token
  const qr = await req('POST', '/v1/access/qr-token', { token, body: { membershipId } });
  if (qr.status !== 200 || !qr.data.token) {
    fail('qr-token', `status=${qr.status} body=${JSON.stringify(qr.data)}`);
  }
  console.log('ok: qr-token');

  // 8. qr-verify valid:true
  const verify = await req('GET', `/v1/access/qr-verify?token=${encodeURIComponent(qr.data.token)}`);
  if (verify.status !== 200 || verify.data.valid !== true) {
    fail('qr-verify', `status=${verify.status} body=${JSON.stringify(verify.data)}`);
  }
  console.log('ok: qr-verify valid:true');

  console.log('E2E smoke passed');
})().catch((e) => fail('unexpected', e && e.stack ? e.stack : String(e)));
