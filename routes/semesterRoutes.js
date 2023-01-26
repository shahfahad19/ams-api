const express = require('express');
const semesterController = require('./../controllers/semesterController');
const auth = require('../controllers/authController');

const router = express.Router();

// Getting semesters in a batch
router
    .route('/batch/:id')
    .get(auth.protect, auth.restrictTo('admin', 'student'), semesterController.getAllSemesters)
    .post(auth.protect, auth.restrictTo('admin'), semesterController.createSemester);

// Semester Crud functions
router
    .route('/:id')
    .get(
        auth.protect,
        auth.restrictTo('admin', 'student'),
        auth.checkSemesterPermission,
        semesterController.getSemester
    )
    .patch(auth.protect, auth.restrictTo('admin'), auth.checkSemesterPermission, semesterController.updateSemester)
    .delete(auth.protect, auth.restrictTo('admin'), auth.checkSemesterPermission, semesterController.deleteSemester);

module.exports = router;
