// Address(es) of the frontend.
// Several can be listed, separated by commas, e.g. the live site and local development:
//   CLIENT_URL=https://karen-weather.vercel.app,http://localhost:3000
// All of them are allowed by CORS; the FIRST one is used in email links.
const CLIENT_URLS = (process.env.CLIENT_URL || 'http://localhost:3000')
    .split(',')
    .map((url) => url.trim().replace(/\/+$/, '')) // "https://site.app/" -> "https://site.app"
    .filter(Boolean);

module.exports = {
    CLIENT_URLS,
    CLIENT_URL: CLIENT_URLS[0],
};
