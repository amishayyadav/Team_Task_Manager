import { env, isProd } from "../config/env.js";

const REFRESH_COOKIE_NAME = "refreshToken";

const baseOptions = () => ({
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "strict" : "lax",
  path: "/api/auth",
});

export function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    ...baseOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, baseOptions());
}

export function readRefreshCookie(req) {
  return req.cookies?.[REFRESH_COOKIE_NAME] || null;
}

export { REFRESH_COOKIE_NAME };
