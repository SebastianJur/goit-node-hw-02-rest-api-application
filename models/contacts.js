const mongoose = require('mongoose');
const fs = require('fs/promises');
const { v4: uuidv4 } = require('uuid');

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
});

const Contact = mongoose.model('Contact', contactSchema);

const listContacts = async () => {
	const contacts = await Contact.find();
	console.log(contacts);
	return contacts;
};

const getContactById = async (contactId) => {
	const data = await fs.readFile(contactsPath);
	const contacts = JSON.parse(data);
	const contact = contacts.find((contact) => contact.id === `${contactId}`);

	if (contact) {
		return contact;
	} else {
		return 'not found';
	}
};

const removeContact = async (contactId) => {
	const data = await fs.readFile(contactsPath);
	const contacts = JSON.parse(data);

	const updateContacts = contacts.filter((contact) => contact.id !== contactId);
	await fs.writeFile(contactsPath, JSON.stringify(updateContacts, null, 2));

	return updateContacts;
};

const addContact = async (body) => {
	const data = await fs.readFile(contactsPath);
	const contacts = JSON.parse(data);

	const newContact = {
		id: uuidv4(),
		...body,
	};
	contacts.push(newContact);

	await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));

	return newContact;
};

const updateContact = async (contactId, body) => {
	const data = await fs.readFile(contactsPath);
	const contacts = JSON.parse(data);

	const indexId = contacts.findIndex(
		(contact) => contact.id === `${contactId}`
	);
	if (indexId === -1) {
		return null;
	}

	contacts[indexId] = { id: contactId, ...body };
	await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
	return contacts[indexId];
};

module.exports = {
	Contact,
	listContacts,
	getContactById,
	removeContact,
	addContact,
	updateContact,
};