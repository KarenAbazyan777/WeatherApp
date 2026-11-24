const nodemailer = require('nodemailer');

// With SMTP settings in .env the email is really sent.
// Without them (local development) the link is printed to the console.
const transporter = process.env.SMTP_HOST
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    })
    : null;

// Tell the developer right away whether emails will really be sent.
// A wrong password is a real error; a network hiccup at startup (DNS timeout,
// slow connection) is not, so for those we try again a few times.
const SMTP_CHECK_ATTEMPTS = 3;
const SMTP_CHECK_DELAY_MS = 5000;

const checkSmtp = (attempt = 1) => {
    transporter.verify()
        .then(() => console.log(`📧 SMTP ready: emails are sent from ${process.env.SMTP_USER}`))
        .catch((err) => {
            if (err.code === 'EAUTH') {
                console.error('❌ SMTP login failed: wrong SMTP_USER or SMTP_PASS (for Gmail use an App password).');
                return;
            }
            if (attempt < SMTP_CHECK_ATTEMPTS) {
                setTimeout(() => checkSmtp(attempt + 1), SMTP_CHECK_DELAY_MS);
                return;
            }
            console.warn(`⚠️  Could not reach the SMTP server to check it (${err.message}). Emails will still be tried when needed.`);
        });
};

if (!transporter) {
    console.warn('⚠️  SMTP is not set in .env: emails are NOT sent, links are printed here instead.');
} else {
    checkSmtp();
}

// One email = a short text + one button-link.
const sendLinkEmail = async ({ to, subject, intro, buttonText, link, outro }) => {
    if (!transporter) {
        console.log(`📧 [dev] ${subject} for ${to}: ${link}`);
        return;
    }

    await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        text: `${intro}\n\n${link}\n\n${outro}`,
        html: `<div style="font-family:Segoe UI,Arial,sans-serif;font-size:16px;color:#0f172a;max-width:480px">
                 <p>${intro}</p>
                 <p><a href="${link}" style="display:inline-block;padding:12px 22px;border-radius:999px;background:#1f6feb;color:#fff;text-decoration:none;font-weight:600">${buttonText}</a></p>
                 <p style="color:#475569;font-size:14px">Or open this link: <a href="${link}">${link}</a></p>
                 <p style="color:#475569;font-size:14px">${outro}</p>
               </div>`,
    });
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

module.exports = { sendPasswordResetEmail, sendVerificationEmail };
