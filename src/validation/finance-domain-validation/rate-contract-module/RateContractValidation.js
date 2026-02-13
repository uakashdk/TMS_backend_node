import Joi from "joi";

export const createRateContractSchema = Joi.object({
  party_id: Joi.number().integer().required(),

  route_id: Joi.number().integer().required(),

  freight_basis: Joi.string()
    .valid("PER_TRIP", "PER_KM", "PER_TON", "FIXED")
    .required(),

  rate: Joi.number().min(0).required(),

  effective_from: Joi.date().required(),

  effective_to: Joi.date().allow(null),
});
