import { ZodError } from "zod";

export const validate = (schema, source = "body") => (req, _res, next) => {
  try {
    const data = schema.parse(req[source]);
    req[source] = data;
    next();
  } catch (err) {
    if (err instanceof ZodError) return next(err);
    next(err);
  }
};
