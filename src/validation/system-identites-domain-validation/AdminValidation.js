import Joi from "joi";

export const createAdminSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(255)
    .required(),

  email: Joi.string()
    .email()
    .required(),

  password: Joi.string()
    .min(6)
    .required(),

  role: Joi.number()
    .integer()
    .required(),

    phone:Joi.number()
    .integer()
    .required(),
}).options({ allowUnknown: false });

 export const updateAdminSchema =Joi.object({
name: Joi.string()
    .trim()
    .min(2)
    .max(255)
    .required(),

  email: Joi.string()
    .email()
    .required(),

    phone:Joi.number()
    .integer()
    .required(),
})
