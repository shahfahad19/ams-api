const express = require('express');
const semesterController = require('./../controllers/semesterController');
const auth = require('../controllers/authController');

const router = express.Router();

// Getting semesters in a batch
// url = /semesters?batch=123456789
router
    .route('/')
    .get(auth.protect, semesterController.getAllSemesters)
    .post(auth.protect, auth.restrictTo('admin'), auth.checkBatchPermission, semesterController.createSemester);

// Semester Crud functions
router
    .route('/:id')
    .get(auth.protect, semesterController.getSemester)
    .patch(auth.protect, auth.restrictTo('admin'), auth.checkSemesterPermission, semesterController.updateSemester)
    .delete(auth.protect, auth.restrictTo('admin'), auth.checkSemesterPermission, semesterController.deleteSemester);

module.exports = router;
