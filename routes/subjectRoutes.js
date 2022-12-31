const express = require('express');
const subjectController = require('./../controllers/subjectController');

const router = express.Router();

router.route('/').get(subjectController.getAllSubjects).post(subjectController.createSubject);

router
    .route('/:id')
    .get(subjectController.getSubject)
    .patch(subjectController.updateSubject)
    .delete(subjectController.deleteSubject);

module.exports = router;
