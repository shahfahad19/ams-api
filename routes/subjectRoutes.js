const express = require('express');
const subjectController = require('../controllers/subjectController');
const auth = require('../controllers/authController');

const router = express.Router();

// Subjects in a semester
router
    .route('/semester/:id')
    .get(auth.protect, auth.restrictTo('admin', 'student'), subjectController.getAllSubjects)
    .post(auth.protect, auth.restrictTo('admin'), subjectController.createSubject);

// Subject CRUD functions
router
    .route('/:id')
    .get(auth.protect, auth.restrictTo('admin', 'student'), auth.checkBatchPermission, subjectController.getSubject)
    .patch(auth.protect, auth.restrictTo('admin'), auth.checkBatchPermission, subjectController.updateSubject)
    .delete(auth.protect, auth.restrictTo('admin'), auth.checkBatchPermission, subjectController.deleteSubject);

module.exports = router;
