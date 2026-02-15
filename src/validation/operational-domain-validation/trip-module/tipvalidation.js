import e from "express";
import Joi from "joi";


export const createTripSchema = Joi.object({
  job_id: Joi.number().integer().required(),
  vehicle_id: Joi.number().integer().required(),
    primary_driver_id: Joi.number().integer().required(),
    secondary_driver_id: Joi.number().integer().optional().allow(null),
    trip_start_date: Joi.date().required(),
    expected_delivery_date: Joi.date().optional().allow(null),
    route_summary: Joi.string().required(),
    route_id: Joi.number().integer().optional().allow(null),
    goods_qty: Joi.number().integer().required()
});


export const updateTripSchema = Joi.object({
  job_id: Joi.number().integer().optional(),
  vehicle_id: Joi.number().integer().optional(),
    primary_driver_id: Joi.number().integer().optional(),
    secondary_driver_id: Joi.number().integer().optional().allow(null),
    trip_start_date: Joi.date().optional(), 
    expected_delivery_date: Joi.date().optional().allow(null),
    route_summary: Joi.string().optional(),
    route_id: Joi.number().integer().optional().allow(null),
    trip_status: Joi.string().valid('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED').optional(),
});


export const TripAdvanceSchema = Joi.object({
    trip_id: Joi.number().integer().required(),
    amount: Joi.number().precision(2).required(),
    payment_mode: Joi.string().valid('CASH', 'UPI', 'BANK', 'CARD').required(),
    remarks: Joi.string().optional().allow(null, ''),
});

export const PodCreationSchema = Joi.object({
    trip_id: Joi.number().integer().required(),
    customer_id: Joi.number().integer().required(),
    delivery_date: Joi.date().required(),
    receiver_name: Joi.string().required(),
    receiver_contact: Joi.string().required(),
    remarks: Joi.string().optional().allow(null, ''),
});


export const TripExpenseSchema = Joi.object({
    trip_id: Joi.number().integer().required(),
    expense_type: Joi.string().valid('FUEL', 'TOLL', 'PARKING', 'FOOD', 'REPAIR', 'OTHER').required(),
    amount: Joi.number().precision(2).required(),
    payment_mode: Joi.string().valid('CASH', 'UPI', 'CARD', 'COMPANY_ACCOUNT').required(),
    description: Joi.string().optional().allow(null, ''),
    expense_date: Joi.date().required(),
});