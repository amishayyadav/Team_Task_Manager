import { asyncHandler } from "../utils/asyncHandler.js";
import { getDashboard } from "../services/dashboard.service.js";

export const dashboard = asyncHandler(async (req, res) => {
  const data = await getDashboard(req.user._id, req.query);
  res.json(data);
});
