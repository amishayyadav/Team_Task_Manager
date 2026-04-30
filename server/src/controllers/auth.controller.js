import { asyncHandler } from "../utils/asyncHandler.js";
import { setRefreshCookie, clearRefreshCookie, readRefreshCookie } from "../utils/cookies.js";
import {
  signupUser,
  loginUser,
  rotateRefreshToken,
  revokeRefreshToken,
} from "../services/auth.service.js";

export const signup = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await signupUser(req.body);
  setRefreshCookie(res, refreshToken);
  res.status(201).json({ user, accessToken });
});

export const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await loginUser(req.body);
  setRefreshCookie(res, refreshToken);
  res.json({ user, accessToken });
});

export const refresh = asyncHandler(async (req, res) => {
  const cookieToken = readRefreshCookie(req);
  try {
    const { accessToken, refreshToken } = await rotateRefreshToken(cookieToken);
    setRefreshCookie(res, refreshToken);
    res.json({ accessToken });
  } catch (err) {
    clearRefreshCookie(res);
    throw err;
  }
});

export const logout = asyncHandler(async (req, res) => {
  const cookieToken = readRefreshCookie(req);
  await revokeRefreshToken(cookieToken);
  clearRefreshCookie(res);
  res.status(204).end();
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
