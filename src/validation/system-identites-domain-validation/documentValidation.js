import Joi from "joi";

export const uploadDocumentSchema = Joi.object({
  entity_type: Joi.string()
    .valid("company", "driver", "vehicle", "pod")
    .required()
    .messages({
      "any.required": "entity_type is required",
      "any.only": "Invalid entity_type",
    }),

  entity_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "any.required": "entity_id is required",
    }),

  document_group: Joi.string()
    .required()
    .messages({
      "any.required": "document_group is required",
    }),

  document_type: Joi.string()
    .required()
    .messages({
      "any.required": "document_type is required",
    }),

  content: Joi.string().allow(null, ""),
});
