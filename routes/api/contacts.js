const express = require('express');
const {
	listContacts,
	getContactById,
	addContact,
	removeContact,
	updateContact,
	updateStatusContact,
} = require('../../controllers/contacts');
const {
	addContactsSchema,
	contactUpdateStatusValidationShema,
} = require('../../models/validator');
const auth = require('../../auth/auth');

const router = express.Router();

router.get('/', auth, async (req, res, next) => {
	try {
		const contacts = await listContacts();
		res.status(200).json(contacts);
	} catch {
		return res.status(500).send('Something went wrong');
	}
});

router.get('/:contactId', auth, async (req, res, next) => {
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

router.post('/', auth, async (req, res, next) => {
	try {
		await addContactsSchema.validateAsync(req.body);
		const newContact = await addContact(req.body);
		return res.status(201).json(newContact);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
});

router.delete('/:contactId', auth, async (req, res, next) => {
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

router.put('/:contactId', auth, async (req, res, next) => {
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

router.patch('/:contactId/favorite', auth, async (req, res, next) => {
	try {
		const { contactId } = req.params;
		const { error } = contactUpdateStatusValidationShema.validate(req.body);
		if (error) {
			return res.status(400).json({ message: 'missing field favorite' });
		}

		const contact = await updateStatusContact(contactId, req.body);
		res.status(200).json(contact);
	} catch {
		return res.status(500).send('Something went wrong');
	}
});

module.exports = router;
