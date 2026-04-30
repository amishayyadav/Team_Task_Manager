import { z } from "zod";

export const addMemberSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

export const updateMemberSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER"]),
});
