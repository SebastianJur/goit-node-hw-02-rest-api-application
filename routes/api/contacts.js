const express = require('express');
const {
	listContacts,
	getContactById,
	addContact,
	removeContact,
	updateContact,
} = require('../../models/contacts');
const { addContactsSchema } = require('../../models/validator');


const router = express.Router();

router.get('/', async (req, res, next) => {
	try {
		const contacts = await listContacts();
		res.status(200).json(contacts);
	} catch {
		return res.status(500).send('Something went wrong');
	}
});

router.get('/:contactId', async (req, res, next) => {
	try {
		const { contactId } = req.params;
		const contact = await getContactById(contactId);

		if (contact === 'not found') {
			return res.status(404).send('Contact with this ID was not found');
		} else {
			return res.status(200).json(contact);
		}
	} catch {
		return res.status(500).send('Something went wrong');
	}
});

router.post('/', async (req, res, next) => {
	try {
		await addContactsSchema.validateAsync(req.body);
		const newContact = await addContact(req.body);
		return res.status(201).json(newContact);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
});

router.delete('/:contactId', async (req, res, next) => {
	try {
		const { contactId } = req.params;
		const contact = await getContactById(contactId);

		if (contact === 'not found') {
			return res.status(404).send('Contact not found');
		}

		await removeContact(contactId);

		return res
			.status(200)
			.send(`Contact with id ${contactId} has been deleted`);
	} catch {
		return res.status(500).send('Something went wrong');
	}
});

router.put('/:contactId', async (req, res, next) => {
	try {
		if (!req.body || Object.keys(req.body).length === 0) {
			return res.status(400).json({ message: 'missing fields' });
		}

		await addContactsSchema.validateAsync(req.body);
		const { contactId } = req.params;
		const contact = await updateContact(contactId, req.body);

		if (!contact) {
			return res.status(404).send('Contact not found');
		}

		res.status(200).send(contact);
	} catch (error) {
		next(error);
	}
});
	
module.exports = router;