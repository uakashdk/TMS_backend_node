const validateRequest = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true, // 👈 removes extra fields
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map(err => err.message),
      });
    }

    req[property] = value;
    next();
  };
};

export default validateRequest;
