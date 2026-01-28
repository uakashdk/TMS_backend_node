import Joi from "joi";

const partyAddressSchema = Joi.object({
  address_type: Joi.string()
    .valid("pickup", "delivery", "billing", "office")
    .required(),

  address_line1: Joi.string().required(),
  address_line2: Joi.string().allow(null, ""),

  city_id: Joi.number().integer().required(),
  state_id: Joi.number().integer().required(),

  postal_code: Joi.string().required(),

  country: Joi.string().default("India"),

  is_primary: Joi.boolean().default(false),
});

/**
 * Party GST Schema
 */
const partyGstSchema = Joi.object({
  gst_number: Joi.string().required(),

  state_id: Joi.number().integer().required(),

  gst_registration_type: Joi.string()
    .valid("regular", "composition", "unregistered")
    .default("regular"),

  is_primary: Joi.boolean().default(false),
});

/**
 * Create Party Validation
 */
export const createPartySchema = Joi.object({
  party_name: Joi.string().required(),

  party_type: Joi.string()
    .valid("client", "consignor", "consignee", "vendor", "broker")
    .required(),

  contact_person: Joi.string().allow(null, ""),
  email: Joi.string().email().allow(null, ""),
  phone_number: Joi.string().allow(null, ""),

  addresses: Joi.array().items(partyAddressSchema).default([]),

  gsts: Joi.array().items(partyGstSchema).default([]),
});


const UpdatePartyAddressSchema = Joi.object({
  address_type: Joi.string()
    .valid("pickup", "delivery", "billing", "office")
    .required(),

  address_line1: Joi.string().required(),
  address_line2: Joi.string().max(255).allow(null, ""),
  city_id: Joi.number().integer().required(),
  state_id: Joi.number().integer().required(),
  postal_code: Joi.string().length(6).pattern(/^[0-9]+$/).required(),
  country: Joi.string().min(2).max(100).default("India"),
  is_primary: Joi.boolean().required()
});

 const UpdatePartyGstSchema = Joi.object({
  gst_number: Joi.string()
    .length(15)
    .required(), // you may validate format later if needed

  state_id: Joi.number().integer().required(),
  gst_registration_type: Joi.string()
    .valid("regular", "composition", "unregistered")
    .required(),

  is_primary: Joi.boolean().required()
});


export const updatePartySchema = Joi.object({
  party_name: Joi.string().min(3).max(150).required(),

  party_type: Joi.string()
    .valid("Client", "Supplier", "Vendor", "Consignor", "Consignee")
    .required(),

  contact_person: Joi.string().min(3).max(100).allow(null, ""),
  phone_number: Joi.string().length(10).pattern(/^[0-9]+$/).allow(null, ""),
  email: Joi.string().email().allow(null, ""),
  is_active: Joi.boolean().default(true),

  // ✅ ARRAYS, not objects
  addresses: Joi.array()
    .items(UpdatePartyAddressSchema)
    .min(1)
    .required(),

  gsts: Joi.array()
    .items(UpdatePartyGstSchema)
    .min(1)
    .required()
});




