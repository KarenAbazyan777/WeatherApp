const nodemailer = require('nodemailer');

// How emails are sent, first match wins:
//   1. BREVO_API_KEY set  -> Brevo HTTP API (port 443, works on any hosting)
//   2. SMTP_HOST set      -> SMTP, e.g. Gmail (some free hostings block SMTP ports)
//   3. nothing            -> local development: links are printed to the console
//
// MAIL_FROM (or SMTP_FROM) = sender shown to users, e.g.  Weather App <me@gmail.com>

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const FROM = process.env.MAIL_FROM || process.env.SMTP_FROM || process.env.SMTP_USER || '';
const TIMEOUT_MS = 10000; // never make a user wait longer than this for an email

const mode = BREVO_API_KEY ? 'brevo' : process.env.SMTP_HOST ? 'smtp' : 'console';

// Current state, shown at GET /health:
// "checking" | "ready" | "not configured (links in console)" | "login failed" | "unreachable: ..."
let status = mode === 'console' ? 'not configured (links in console)' : 'checking';
const setStatus = (value, log) => {
    status = value;
    log();
};

// "Weather App <me@gmail.com>" -> { name: "Weather App", email: "me@gmail.com" }
const parseFrom = (from) => {
    const m = from.match(/^\s*(.*?)\s*<\s*([^>]+)\s*>\s*$/);
    return m ? { name: m[1] || undefined, email: m[2] } : { email: from.trim() };
};

const transporter = mode === 'smtp'
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        connectionTimeout: TIMEOUT_MS,
        greetingTimeout: TIMEOUT_MS,
        socketTimeout: TIMEOUT_MS,
    })
    : null;

// ---- startup check ---------------------------------------------------------
// A wrong password/key is a real error; a network hiccup at startup is not,
// so for those we try again a few times.
const CHECK_ATTEMPTS = 3;
const CHECK_DELAY_MS = 5000;

const checkSmtp = (attempt = 1) => {
    transporter.verify()
        .then(() => setStatus('ready', () => console.log(`📧 Email ready (SMTP): sent from ${FROM}`)))
        .catch((err) => {
            if (err.code === 'EAUTH') {
                setStatus('login failed', () => console.error('❌ SMTP login failed: wrong SMTP_USER or SMTP_PASS (for Gmail use an App password).'));
                return;
            }
            if (attempt < CHECK_ATTEMPTS) {
                setTimeout(() => checkSmtp(attempt + 1), CHECK_DELAY_MS);
                return;
            }
            setStatus(`unreachable: ${err.message}`, () => console.warn(`⚠️  Could not reach the SMTP server (${err.message}). This hosting may block SMTP; set BREVO_API_KEY to send through the Brevo API instead.`));
        });
};

// Brevo keys can be limited to "send email" only, so there is nothing safe to
// check at startup: the status is updated by the first real email instead.
if (mode === 'brevo') setStatus('configured, waiting for the first email', () => console.log(`📧 Email via Brevo API, sent from ${FROM}`));
else if (mode === 'smtp') checkSmtp();
else console.warn('⚠️  Email is not set in .env: emails are NOT sent, links are printed here instead.');

// ---- sending ---------------------------------------------------------------
const sendViaBrevo = async ({ to, subject, text, html }) => {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
            sender: parseFrom(FROM),
            to: [{ email: to }],
            subject,
            textContent: text,
            htmlContent: html,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`Brevo API ${res.status}: ${body.slice(0, 200)}`);
    }
};

// One email = a short text + one button-link.
const sendLinkEmail = async ({ to, subject, intro, buttonText, link, outro }) => {
    if (mode === 'console') {
        console.log(`📧 [dev] ${subject} for ${to}: ${link}`);
        return;
    }

    const text = `${intro}\n\n${link}\n\n${outro}`;
    const html = `<div style="font-family:Segoe UI,Arial,sans-serif;font-size:16px;color:#0f172a;max-width:480px">
                 <p>${intro}</p>
                 <p><a href="${link}" style="display:inline-block;padding:12px 22px;border-radius:999px;background:#1f6feb;color:#fff;text-decoration:none;font-weight:600">${buttonText}</a></p>
                 <p style="color:#475569;font-size:14px">Or open this link: <a href="${link}">${link}</a></p>
                 <p style="color:#475569;font-size:14px">${outro}</p>
               </div>`;

    try {
        if (mode === 'brevo') {
            await sendViaBrevo({ to, subject, text, html });
        } else {
            await transporter.sendMail({ from: FROM, to, subject, text, html });
        }
        status = `ready (last email sent ${new Date().toISOString()})`;
    } catch (error) {
        status = `last email failed: ${error.message}`;
        throw error;
    }
};

const sendPasswordResetEmail = (to, link) => sendLinkEmail({
    to,
    link,
    subject: 'Reset your password',
    intro: 'Open this link to set a new password (valid for 1 hour):',
    buttonText: 'Set a new password',
    outro: 'If you did not ask for this, ignore this email.',
});

const sendVerificationEmail = (to, name, link) => sendLinkEmail({
    to,
    link,
    subject: 'Confirm your email',
    intro: `Hi ${name}! Please confirm your email to finish creating your Weather account (link valid for 24 hours):`,
    buttonText: 'Confirm my email',
    outro: 'If you did not sign up, ignore this email.',
});

// For GET /health: which way emails go and whether it works.
const getEmailStatus = () => ({ mode, status });

module.exports = { sendPasswordResetEmail, sendVerificationEmail, getEmailStatus };
