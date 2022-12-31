const express = require('express');
const teacherController = require('./../controllers/teacherController');

const router = express.Router();

router.route('/').get(teacherController.getAllTeachers).post(teacherController.createTeacher);

router
    .route('/:id')
    .get(teacherController.getTeacher)
    .patch(teacherController.updateTeacher)
    .delete(teacherController.deleteTeacher);

module.exports = router;
