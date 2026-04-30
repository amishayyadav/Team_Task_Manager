import mongoose from "mongoose";

/**
 * Runs `fn(session)` inside a Mongoose transaction when the underlying
 * MongoDB topology supports it (replica set / mongos). Falls back to
 * running `fn(null)` without a session for standalone instances.
 */
export async function withOptionalTransaction(fn) {
  let session = null;
  try {
    session = await mongoose.startSession();
    let result;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result;
  } catch (err) {
    const msg = String(err?.message || "");
    const standalone =
      msg.includes("Transaction numbers are only allowed on a replica set") ||
      msg.includes("This MongoDB deployment does not support retryable writes") ||
      err?.codeName === "IllegalOperation";
    if (!standalone) throw err;
    return await fn(null);
  } finally {
    if (session) await session.endSession();
  }
}
