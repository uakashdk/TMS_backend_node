import Joi from "joi";

export const createRoleSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z0-9_\-\s]+$/) // allow clean role names
    .required(),

  description: Joi.string()
    .trim()
    .max(500)
    .allow("", null) // allow empty description
    .optional(),

}).options({ allowUnknown: false });


export const UpdateRoleSchema = Joi.object({
  name: Joi.string().trim().required(),

  description: Joi.string()
    .trim()
    .max(500)
    .allow("", null)
    .optional(),

  // ✅ FIXED FIELD NAME + TYPE
  permission_ids: Joi.array()
    .items(Joi.number().integer())
    .required()
}).options({ allowUnknown: false });