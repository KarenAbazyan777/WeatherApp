// End-to-end tests of the API: a real Express app on a temporary in-memory
// MongoDB, called over HTTP like the frontend does. Run with: npm test
//
// Tests run in order and share state (the same user, the same rate limits),
// like a real user going through sign up -> sign in -> places -> password reset.
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');

// ---- environment for the app (set before the app files are loaded) --------
process.env.JWT_ACCESS_SECRET = 'test-secret';
delete process.env.SMTP_HOST;      // no real emails: links are printed instead
delete process.env.BREVO_API_KEY;
delete process.env.TRUST_PROXY;

// The app prints email links to the console in this mode; catch them.
const links = { verify: null, reset: null };
const originalLog = console.log;
console.log = (...args) => {
    const text = args.join(' ');
    const verify = text.match(/verify\/([a-f0-9]+)/);
    const reset = text.match(/resetpassword\/([a-f0-9]+)/);
    if (verify) links.verify = verify[1];
    else if (reset) links.reset = reset[1];
    else originalLog(...args);
};
console.warn = () => {};

const { MongoMemoryServer } = require('mongodb-memory-server-core');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const app = require('../app');

let mongo;
let server;
let BASE;

// Small helper: call the API, return { status, body }
const api = async (path, { body, token, method } = {}) => {
    const res = await fetch(BASE + path, {
        method: method || (path === '/auth/myaccount' || path === '/health' ? 'GET' : 'POST'),
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
    });
    let json = null;
    try { json = await res.json(); } catch { /* empty body */ }
    return { status: res.status, body: json, headers: res.headers };
};

// One outer group: in Node 18 the before/after hooks only run for the tests
// when they are inside the same describe().
describe('Weather API', () => {
    before(async () => {
        mongo = await MongoMemoryServer.create();
        await mongoose.connect(mongo.getUri('weather-test'));
        // 127.0.0.1, not "localhost": with "localhost" Node may use IPv4 for some
        // requests and IPv6 for others, and the rate limiter would see two users.
        await new Promise((resolve) => { server = app.listen(0, '127.0.0.1', resolve); });
        BASE = `http://127.0.0.1:${server.address().port}`;
    });

    after(async () => {
        server.close();
        await mongoose.disconnect();
        await mongo.stop();
        console.log = originalLog;
    });

    const USER = { username: 'Test', userlname: 'User', useremail: 'Test@Mail.com', userpassword: 'abc123' };
    let token;

    describe('sign up', () => {
        it('creates an account (201) and sends a confirmation link', async () => {
            const r = await api('/auth/signup', { body: USER });
            assert.equal(r.status, 201);
            assert.ok(links.verify, 'confirmation link was sent');
        });

        it('refuses the same email again (409)', async () => {
            assert.equal((await api('/auth/signup', { body: USER })).status, 409);
        });

        it('refuses a short password (400)', async () => {
            assert.equal((await api('/auth/signup', { body: { ...USER, useremail: 'x@y.com', userpassword: '1' } })).status, 400);
        });
    });

    describe('email confirmation', () => {
        it('blocks sign in until the email is confirmed (403 EMAIL_NOT_VERIFIED)', async () => {
            const r = await api('/auth/signin', { body: { useremail: 'test@mail.com', userpassword: 'abc123' } });
            assert.equal(r.status, 403);
            assert.equal(r.body.code, 'EMAIL_NOT_VERIFIED');
        });

        it('refuses a fake link and an object as token (NoSQL injection)', async () => {
            assert.equal((await api('/auth/verifyemail', { body: { token: 'deadbeef' } })).status, 400);
            assert.equal((await api('/auth/verifyemail', { body: { token: { $ne: '' } } })).status, 400);
        });

        it('confirms with the real link, which then works only once', async () => {
            const link = links.verify;
            assert.equal((await api('/auth/verifyemail', { body: { token: link } })).status, 200);
            assert.equal((await api('/auth/verifyemail', { body: { token: link } })).status, 400);
        });

        it('"send again" gives the same answer for confirmed and unknown emails, and sends nothing', async () => {
            links.verify = null;
            assert.equal((await api('/auth/resendverification', { body: { useremail: 'test@mail.com' } })).status, 200);
            assert.equal((await api('/auth/resendverification', { body: { useremail: 'nobody@mail.com' } })).status, 200);
            assert.equal(links.verify, null);
        });

        it('"send again" makes a new link and the old one stops working', async () => {
            links.verify = null;
            await api('/auth/signup', { body: { username: 'Ann', userlname: 'B', useremail: 'ann@mail.com', userpassword: 'abc123' } });
            const oldLink = links.verify;
            await api('/auth/resendverification', { body: { useremail: 'ann@mail.com' } });
            assert.ok(links.verify && links.verify !== oldLink);
            assert.equal((await api('/auth/verifyemail', { body: { token: oldLink } })).status, 400);
        });

        it('accounts made before email confirmation existed can still sign in', async () => {
            await mongoose.connection.collection('users').insertOne({
                username: 'Old', userlname: 'User', useremail: 'old@mail.com',
                userpassword: await bcrypt.hash('abc123', 10), places: [],
            });
            assert.equal((await api('/auth/signin', { body: { useremail: 'old@mail.com', userpassword: 'abc123' } })).status, 200);
        });

        it('a password reset by email also confirms the account', async () => {
            links.reset = null;
            await api('/auth/forgotpassword', { body: { useremail: 'ann@mail.com' } });
            await api('/auth/resetpassword', { body: { token: links.reset, userpassword: 'annpass1' } });
            assert.equal((await api('/auth/signin', { body: { useremail: 'ann@mail.com', userpassword: 'annpass1' } })).status, 200);
        });
    });

    describe('sign in', () => {
        it('wrong password and unknown email give the same 401 answer', async () => {
            const wrong = await api('/auth/signin', { body: { useremail: 'test@mail.com', userpassword: 'wrong1' } });
            const unknown = await api('/auth/signin', { body: { useremail: 'nobody@mail.com', userpassword: 'abc123' } });
            assert.equal(wrong.status, 401);
            assert.equal(unknown.status, 401);
            assert.equal(wrong.body.message, unknown.body.message);
        });

        it('returns a token; the email is not case-sensitive', async () => {
            const r = await api('/auth/signin', { body: { useremail: 'TEST@mail.com', userpassword: 'abc123' } });
            assert.equal(r.status, 200);
            assert.ok(r.body.token);
            token = r.body.token;
        });
    });

    describe('my account', () => {
        it('needs a valid token (401 without or with a fake one)', async () => {
            assert.equal((await api('/auth/myaccount')).status, 401);
            assert.equal((await api('/auth/myaccount', { token: 'garbage' })).status, 401);
        });

        it('never sends the password hash or tokens', async () => {
            const r = await api('/auth/myaccount', { token });
            assert.equal(r.status, 200);
            for (const secret of ['userpassword', 'resetPasswordToken', 'verifyToken']) {
                assert.ok(!(secret in r.body), `${secret} must not be sent`);
            }
        });
    });

    describe('saved places', () => {
        it('adds places and refuses duplicates (409)', async () => {
            await api('/auth/places', { token, body: { place: 'PARIS' } });
            const r = await api('/auth/places', { token, body: { place: 'YEREVAN' } });
            assert.deepEqual(r.body, ['PARIS', 'YEREVAN']);
            assert.equal((await api('/auth/places', { token, body: { place: 'PARIS' } })).status, 409);
        });

        it('removing a place that is not there changes nothing (old bug removed the last one)', async () => {
            const r = await api('/auth/deleteplaces', { token, body: { place: 'NOT-THERE' } });
            assert.deepEqual(r.body, ['PARIS', 'YEREVAN']);
        });

        it('removes a place', async () => {
            const r = await api('/auth/deleteplaces', { token, body: { place: 'PARIS' } });
            assert.deepEqual(r.body, ['YEREVAN']);
        });

        it('refuses an object, a blank or a missing place (400)', async () => {
            assert.equal((await api('/auth/places', { token, body: { place: { $gt: '' } } })).status, 400);
            assert.equal((await api('/auth/places', { token, body: { place: '   ' } })).status, 400);
            assert.equal((await api('/auth/deleteplaces', { token, body: {} })).status, 400);
        });

        it('10 requests at the same time for the SAME place: exactly one is saved', async () => {
            const results = await Promise.all(Array.from({ length: 10 }, () => api('/auth/places', { token, body: { place: 'ROME' } })));
            const statuses = results.map((r) => r.status);
            assert.equal(statuses.filter((s) => s === 200).length, 1);
            assert.equal(statuses.filter((s) => s === 409).length, 9);
        });

        it('10 requests at the same time for DIFFERENT places: none is lost', async () => {
            const cities = Array.from({ length: 10 }, (_, i) => `CITY${i}`);
            await Promise.all(cities.map((place) => api('/auth/places', { token, body: { place } })));
            const { body } = await api('/auth/myaccount', { token });
            assert.deepEqual(cities.filter((c) => !body.places.includes(c)), []);

            await Promise.all(cities.map((place) => api('/auth/deleteplaces', { token, body: { place } })));
            assert.deepEqual((await api('/auth/myaccount', { token })).body.places, ['YEREVAN', 'ROME']);
        });
    });

    describe('password reset', () => {
        it('same answer for unknown and known emails; only the known one gets a link', async () => {
            links.reset = null;
            assert.equal((await api('/auth/forgotpassword', { body: { useremail: 'nobody@mail.com' } })).status, 200);
            assert.equal(links.reset, null);
            assert.equal((await api('/auth/forgotpassword', { body: { useremail: 'test@mail.com' } })).status, 200);
            assert.ok(links.reset);
        });

        it('fake token refused; real token works once; then only the new password works', async () => {
            const link = links.reset;
            assert.equal((await api('/auth/resetpassword', { body: { token: 'deadbeef', userpassword: 'newpass1' } })).status, 400);
            assert.equal((await api('/auth/resetpassword', { body: { token: link, userpassword: 'newpass1' } })).status, 200);
            assert.equal((await api('/auth/resetpassword', { body: { token: link, userpassword: 'again123' } })).status, 400);
            assert.equal((await api('/auth/signin', { body: { useremail: 'test@mail.com', userpassword: 'abc123' } })).status, 401);
            assert.equal((await api('/auth/signin', { body: { useremail: 'test@mail.com', userpassword: 'newpass1' } })).status, 200);
        });
    });

    describe('delete account', () => {
        it('deletes the account; the old token then gets 404', async () => {
            assert.equal((await api('/auth/deleteaccount', { token })).status, 200);
            assert.equal((await api('/auth/myaccount', { token })).status, 404);
        });
    });

    describe('hardening', () => {
        it('broken JSON -> 400, not a server error', async () => {
            assert.equal((await api('/auth/signin', { body: '{broken json' })).status, 400);
        });

        it('body over 10 kB -> 413', async () => {
            assert.equal((await api('/auth/signin', { body: { x: 'a'.repeat(20000) } })).status, 413);
        });

        it('security headers are set and Express is not advertised', async () => {
            const r = await api('/health');
            assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
            assert.equal(r.headers.get('x-powered-by'), null);
        });

        it('/health reports the database and email status', async () => {
            const r = await api('/health');
            assert.equal(r.body.ok, true);
            assert.equal(r.body.database, 'connected');
            assert.equal(r.body.email.mode, 'console');
        });

        // Last on purpose: after this the test IP is blocked for sign in.
        it('password guessing is blocked after 10 failed sign-ins (429), even with the right password', async () => {
            const statuses = [];
            for (let i = 0; i < 12; i += 1) {
                statuses.push((await api('/auth/signin', { body: { useremail: 'nobody@mail.com', userpassword: `wrong-${i}` } })).status);
            }
            assert.ok(statuses.includes(429), `expected a 429, got ${statuses.join(',')}`);
            const right = await api('/auth/signin', { body: { useremail: 'old@mail.com', userpassword: 'abc123' } });
            assert.equal(right.status, 429);
        });
    });
});
