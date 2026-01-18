import Joi from "joi";

export const createDriverSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(255)
    .required(),

  phone_number: Joi.string()
    .trim()
    .pattern(/^[0-9]{10}$/)
    .required(),

  email_address: Joi.string()
    .email()
    .lowercase()
    .required(),

  password: Joi.string()
    .min(6)
    .optional(), // required only when admin not exists (controller decides)

  address_line_1: Joi.string().trim().allow(null, ""),
  address_line_2: Joi.string().trim().allow(null, ""),
  city_town_village_name: Joi.string().trim().allow(null, ""),
  state_province_region_name: Joi.string().trim().allow(null, ""),
  pin_code: Joi.string().trim().allow(null, ""),

  driver_license_number: Joi.string()
    .trim()
    .required(),

  driver_license_expiry_date: Joi.date()
    .greater("now")
    .required()
});

export const updateDriverSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(255)
    .required(),

  phone_number: Joi.string()
    .trim()
    .pattern(/^[0-9]{10}$/)
    .required(),

  email_address: Joi.string()
    .email()
    .lowercase()
    .required(),

  password: Joi.string()
    .min(6)
    .optional(), // required only when admin not exists (controller decides)

  address_line_1: Joi.string().trim().allow(null, ""),
  address_line_2: Joi.string().trim().allow(null, ""),
  city_town_village_name: Joi.string().trim().allow(null, ""),
  state_province_region_name: Joi.string().trim().allow(null, ""),
  pin_code: Joi.string().trim().allow(null, ""),

  driver_license_number: Joi.string()
    .trim()
    .required(),

  driver_license_expiry_date: Joi.date()
    .greater("now")
    .required()
})
