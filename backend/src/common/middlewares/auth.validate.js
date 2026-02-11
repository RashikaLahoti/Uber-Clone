export const validate = (schema) => {
  return async (req, res, next) => {
    console.log("Request body from validate function->", req.body);
    try {
      await schema.parseAsync({
        body: req.body,
      });

      return next();
    } catch (error) {
      console.log("Validation Error caught:", error);
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors,
      });
    }
  };
};
