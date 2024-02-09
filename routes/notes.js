const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notes');
const {authenticateUser} = require('../middleware/isAuth');

router.post('/api/addnotes', authenticateUser,notesController.addNotes);
router.post('/api/addsubnote/:id', authenticateUser,notesController.addSubNotes);

router.put('/api/updateonesubnotes', authenticateUser, notesController.updateSubNotes);
router.put('/api/updateheading/:id', authenticateUser, notesController.updateMainHeading);
router.put('/api/updatenotestatus/:id', authenticateUser, notesController.updateNoteStatus);
router.put('/api/updateContentStatus', authenticateUser, notesController.updateContentStatus);

router.get('/api/getnotes', authenticateUser,notesController.getNotes);
router.get('/api/getonemainnote/:id', authenticateUser,notesController.getOneMainNote);
router.get('/api/getonesubnote',authenticateUser,notesController.getOneSubNote);

router.delete('/api/deleteMainNote/:id',authenticateUser, notesController.deleteMainNote);
router.delete('/api/deleteSubNote',authenticateUser, notesController.deleteSubNote);

module.exports = router;