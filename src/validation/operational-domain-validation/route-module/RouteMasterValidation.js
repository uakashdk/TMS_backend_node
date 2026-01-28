import Joi from "joi";

/**
 * Create Route Validation Schema
 */
export const createRouteSchema = Joi.object({
  route_name: Joi.string()
    .min(3)
    .max(150)
    .required()
    .messages({
      "string.base": "Route name must be a string",
      "string.empty": "Route name is required",
      "any.required": "Route name is required",
      "string.min": "Route name must be at least 3 characters",
      "string.max": "Route name cannot exceed 150 characters",
    }),

  source_city: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.base": "Source city must be a string",
      "string.empty": "Source city is required",
      "any.required": "Source city is required",
      "string.min": "Source city must be at least 2 characters",
      "string.max": "Source city cannot exceed 100 characters",
    }),

  destination_city: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.base": "Destination city must be a string",
      "string.empty": "Destination city is required",
      "any.required": "Destination city is required",
      "string.min": "Destination city must be at least 2 characters",
      "string.max": "Destination city cannot exceed 100 characters",
    }),

  distance_km: Joi.number()
    .precision(2)
    .positive()
    .required()
    .messages({
      "number.base": "Distance must be a number",
      "number.positive": "Distance must be a positive number",
      "any.required": "Distance is required",
    }),

  estimated_travel_time_minutes: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "Estimated travel time must be a number",
      "number.integer": "Estimated travel time must be an integer",
      "number.positive": "Estimated travel time must be positive",
      "any.required": "Estimated travel time is required",
    }),
});



export const updateRouteSchema = Joi.object({
  route_name: Joi.string()
    .min(3)
    .max(150)
    .allow(null, ""),

  source_city: Joi.string()
    .min(2)
    .max(100),

  destination_city: Joi.string()
    .min(2)
    .max(100),

  distance_km: Joi.number()
    .positive()
    .precision(2),

  estimated_travel_time_minutes: Joi.number()
    .integer()
    .positive(),

  status: Joi.boolean(),
})
.min(1);