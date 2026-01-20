import Joi from "joi";

export const createVehicleSchema = Joi.object({
  vehicle_number: Joi.string()
    .trim()
    .uppercase()
    .min(6)
    .max(20)
    .required()
    .messages({
      "string.empty": "Vehicle number is required",
      "any.required": "Vehicle number is required",
    }),

  vehicle_type: Joi.string()
    .valid("TRUCK", "CONTAINER", "TRAILER", "TEMPO")
    .required(),

  capacity_weight_kg: Joi.number()
    .positive()
    .required(),

  capacity_volume_cbm: Joi.number()
    .positive()
    .required(),

  fuel_type: Joi.string()
    .valid("DIESEL", "PETROL", "CNG", "ELECTRIC")
    .required(),

  fitness_expiry_date: Joi.date()
    .optional()
    .allow(null),

  is_Mkt: Joi.string()
    .valid("Y", "N")
    .default("N"),
});


export  const updateVehicleSchema = Joi.object({
  capacity_weight_kg: Joi.number()
    .positive()
    .required(),

  capacity_volume_cbm: Joi.number()
    .positive()
    .required(),

  fuel_type: Joi.string()
    .valid("DIESEL", "PETROL", "CNG", "ELECTRIC")
    .required(),

  fitness_expiry_date: Joi.date()
    .optional()
    .allow(null),

  is_Mkt: Joi.string()
    .valid("Y", "N")
    .default("N"),
})
