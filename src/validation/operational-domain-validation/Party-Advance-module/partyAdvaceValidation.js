import Joi from "joi";

export const createPartyAdvanceJobSchema = Joi.object(
{
    party_id:Joi.number().required(),
    advance_date:Joi.date().required(),
    amount:Joi.number().required(),
    payment_mode:Joi.string().required(),
    reference_number:Joi.string()
}
)


export const adjustPartyAdvanceValidation = Joi.object({
    invoice_id:Joi.number().required(),
    party_advance_id:Joi.number().required(),
    adjusted_amount:Joi.number().required()
})