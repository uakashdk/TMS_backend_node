import Joi from "joi";
export const createCompanySchema = Joi.object({
   name: Joi.string().required(),
  address: Joi.string().required(),
  company_code: Joi.string().required(),
  company_email: Joi.string().email().required(),
  contact_person: Joi.string().required(),
  status: Joi.boolean().optional(),

  // 🔥 ADMIN FIELDS (MANDATORY)
  Adminname: Joi.string().required(),
  Adminemail: Joi.string().email().required(),
  Adminpassword: Joi.string().min(8).required(),
  Adminphone: Joi.string().required(),
});
export const updateCompanySchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(255)
    .optional(),

  address: Joi.string()
    .trim()
    .max(500)
    .allow(null, "")
    .optional(),

  company_code: Joi.string()
    .trim()
    .uppercase()
    .min(2)
    .max(50)
    .optional(),

  company_email: Joi.string()
    .email()
    .optional(),

  contact_person: Joi.string()
    .trim()
    .max(255)
    .allow(null, "")
    .optional(),

  document_id: Joi.number()
    .integer()
    .positive()
    .allow(null)
    .optional(),

  status: Joi.boolean()
    .optional(),
}).min(1);
export const companyIdParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required(),
});
export const getCompaniesQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .positive()
    .default(1),

  limit: Joi.number()
    .integer()
    .positive()
    .max(100)
    .default(10),

  status: Joi.boolean()
    .optional(),
});