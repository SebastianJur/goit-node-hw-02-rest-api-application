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

module.exports = { addContactsSchema, contactUpdateStatusValidationShema };
