import Joi from "joi";

export const createJobSchema = Joi.object({
  customer_id: Joi.number().integer(),

  job_date: Joi.date().required(),

  goods_type: Joi.string().trim().required(),

  goods_quantity: Joi.number().positive().required(),

  quantity_units: Joi.string().trim().required(),

  pickup_location: Joi.string().trim().required(),

  dropoff_location: Joi.string().trim().required(),
  route_id: Joi.number().integer().required(),
});


export const updateJobSchema = Joi.object({
  status: Joi.number().valid(0, 1).required(),
  job_date: Joi.date().required(),
  goods_type: Joi.string().required(),
  goods_quantity: Joi.number().required(),
  quantity_units: Joi.string().required(),
  pickup_location: Joi.string().required(),
  dropoff_location: Joi.string().required(),
  route_id:Joi.number().required(),
});
