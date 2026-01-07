import Joi from "joi";

export const loginValidation = Joi.object({
  username: Joi.string().trim().min(3).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).required()
}).or('username', 'email');