import { User, RefreshToken } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  refreshExpiresAt,
} from "../utils/jwt.js";
import { withOptionalTransaction } from "../utils/transactions.js";

async function issueRefreshToken(user) {
  const token = signRefreshToken(user);
  await RefreshToken.create({
    user: user._id,
    token: hashToken(token),
    expiresAt: refreshExpiresAt(),
  });
  return token;
}

export async function signupUser({ email, password, name }) {
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict("An account with this email already exists");

  const user = await withOptionalTransaction(async (session) => {
    const docs = await User.create([{ email, password, name }], session ? { session } : undefined);
    return docs[0];
  });

  const accessToken = signAccessToken(user);
  const refreshToken = await issueRefreshToken(user);
  return { user, accessToken, refreshToken };
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw ApiError.unauthorized("Invalid email or password");
  const ok = await user.comparePassword(password);
  if (!ok) throw ApiError.unauthorized("Invalid email or password");
  user.password = undefined;

  const accessToken = signAccessToken(user);
  const refreshToken = await issueRefreshToken(user);
  return { user, accessToken, refreshToken };
}

export async function rotateRefreshToken(rawToken) {
  if (!rawToken) throw ApiError.unauthorized("Missing refresh token");

  let payload;
  try {
    payload = verifyRefreshToken(rawToken);
  } catch {
    throw ApiError.unauthorized("Invalid refresh token");
  }

  const tokenHash = hashToken(rawToken);
  // Atomically claim the token so concurrent refreshes can't both succeed.
  const claimed = await RefreshToken.findOneAndUpdate(
    {
      user: payload.sub,
      token: tokenHash,
      used: false,
      expiresAt: { $gt: new Date() },
    },
    { $set: { used: true } },
    { new: true }
  );
  if (!claimed) throw ApiError.unauthorized("Refresh token is invalid or already used");

  const user = await User.findById(payload.sub);
  if (!user) throw ApiError.unauthorized("User no longer exists");

  const accessToken = signAccessToken(user);
  const refreshToken = await issueRefreshToken(user);
  return { user, accessToken, refreshToken };
}

export async function revokeRefreshToken(rawToken) {
  if (!rawToken) return;
  const tokenHash = hashToken(rawToken);
  await RefreshToken.deleteOne({ token: tokenHash });
}
