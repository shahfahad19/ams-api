const express = require('express');
const semesterController = require('./../controllers/semesterController');

const router = express.Router();

router.route('/').get(semesterController.getAllSemesters).post(semesterController.createSemester);

router
    .route('/:id')
    .get(semesterController.getSemester)
    .patch(semesterController.updateSemester)
    .delete(semesterController.deleteSemester);

module.exports = router;
