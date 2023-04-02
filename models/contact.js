const mongoose = require('mongoose');

const Shema = mongoose.Schema;

const contactSchema = new Shema({
	name: {
		type: String,
	},
	email: {
		type: String,
	},
	phone: {
		type: String,
	},
	favorite: {
		type: Boolean,
		default: false,
	},
	owner: {
		type: mongoose.SchemaTypes.ObjectId,
		ref: 'user',
	},
});

const Contact = mongoose.model('Contact', contactSchema);

module.exports = {
	Contact,
};