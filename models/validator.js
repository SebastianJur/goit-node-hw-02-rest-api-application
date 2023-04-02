const Joi = require('joi');

const addContactsSchema = Joi.object({
	name: Joi.string().min(3).required(),
	email: Joi.string().min(5).required(),
	phone: Joi.string().min(10).required(),
	favorite: Joi.boolean(),
});

const contactUpdateStatusValidationShema = Joi.object({
	favorite: Joi.boolean().required(),
});

const userCreateValidationShema = Joi.object({
	email: Joi.string().email().required(),
	password: Joi.string().min(6).required(),
	subscription: Joi.string().valid('starter', 'pro', 'business'),
});

const userSubscriptionUpdateValidationShema = Joi.object({
	subscription: Joi.string().valid('starter', 'pro', 'business').required(),
});

module.exports = {
	addContactsSchema,
	contactUpdateStatusValidationShema,
	userCreateValidationShema,
	userSubscriptionUpdateValidationShema,
};