const fs = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const contactsPath = path.resolve(__dirname, './contacts.json');

const listContacts = async () => {
	const data = await fs.readFile(contactsPath);
	return JSON.parse(data);
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
	listContacts,
	getContactById,
	removeContact,
	addContact,
	updateContact,
};
