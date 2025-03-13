const cookie = require('cookie');

export default function parseCookies(req) {
  return cookie.parse(req ? req.headers.cookie || '': '')
}
