import Joi from "joi";

export const assignDriverToVehicleSchema = Joi.object({
  vehicleId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "Vehicle ID must be a number",
      "number.integer": "Vehicle ID must be an integer",
      "any.required": "Vehicle ID is required"
    }),

  driverId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "Driver ID must be a number",
      "number.integer": "Driver ID must be an integer",
      "any.required": "Driver ID is required"
    }),

  startDateTime: Joi.date()
    .iso()
    .required()
    .messages({
      "date.base": "Start date time must be a valid date",
      "date.format": "Start date time must be in ISO format",
      "any.required": "Start date time is required"
    }),

  remark: Joi.string()
    .max(255)
    .allow("", null)
    .messages({
      "string.base": "Remark must be a string",
      "string.max": "Remark cannot exceed 255 characters"
    })
});


export const unassignDriverFromVehicleSchema = Joi.object({
  assignmentId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "any.required": "Assignment ID is required",
      "number.base": "Assignment ID must be a number",
      "number.integer": "Assignment ID must be an integer",
      "number.positive": "Assignment ID must be a positive number"
    })
});


export const getCurrentVehicleOfDriverSchema = Joi.object({
  driverId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "any.required": "Driver ID is required",
      "number.base": "Driver ID must be a number",
      "number.integer": "Driver ID must be an integer",
      "number.positive": "Driver ID must be a positive number"
    })
});


export const getActiveVehicleDriverMappingSchema = Joi.object({
  vehicleId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "Vehicle ID must be a number",
      "number.integer": "Vehicle ID must be an integer",
      "number.positive": "Vehicle ID must be a positive number",
      "any.required": "Vehicle ID is required",
    }),
});


export const getAssignedDriversByVehicleSchema = {
  params: Joi.object({
    vehicleId: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        "number.base": "Vehicle ID must be a number",
        "number.positive": "Vehicle ID must be positive",
        "any.required": "Vehicle ID is required"
      })
  })
};


export const vehicleAssignmentHistorySchema = Joi.object({
  vehicleId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "any.required": "Vehicle ID is required",
      "number.base": "Vehicle ID must be a number"
    })
});
