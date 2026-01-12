import env from '../config/env.js';

const isProd = env.NODE_ENV === 'production';

// Compute sane defaults for cookie options depending on environment
export const getCookieOptions = ({ maxAge } = {}) => {
  const sameSite = env.COOKIE_SAMESITE || (isProd ? 'none' : 'lax');
  const secure = typeof env.COOKIE_SECURE === 'boolean' ? env.COOKIE_SECURE : isProd;

  const base = {
    httpOnly: true,
    secure,
    sameSite,
    path: '/',
  };

  if (env.COOKIE_DOMAIN) {
    base.domain = env.COOKIE_DOMAIN;
  }

  if (typeof maxAge === 'number') {
    base.maxAge = maxAge; // in ms
  }

  return base;
};

export const setAuthCookies = (res, { accessToken, refreshToken, accessTtlMs, refreshTtlMs } = {}) => {
  if (accessToken) {
    res.cookie('token', accessToken, getCookieOptions({ maxAge: accessTtlMs ?? 15 * 60 * 1000 }));
  }
  if (refreshToken) {
    res.cookie('refreshToken', refreshToken, getCookieOptions({ maxAge: refreshTtlMs ?? 7 * 24 * 60 * 60 * 1000 }));
  }
};

export const clearAuthCookies = (res) => {
  // To reliably clear, options must match those used when setting
  const optsShort = getCookieOptions();
  res.clearCookie('token', optsShort);
  res.clearCookie('refreshToken', optsShort);
};
