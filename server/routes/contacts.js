const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/AuthMiddleware');
const { searchContacts, getContactsForDMList, getAllContacts } = require('../controllers/ContactsController');

router.post('/search', verifyToken, searchContacts);
router.get('/get-contacts-for-dm', verifyToken, getContactsForDMList);
router.get('/get-all-contacts', verifyToken, getAllContacts);

module.exports = router;
