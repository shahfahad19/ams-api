const express = require('express');
const subjectController = require('../controllers/subjectController');
const defaultSubjectController = require('../controllers/defaultSubjectController');

const auth = require('../controllers/authController');

const router = express.Router();

// Routes for super-admin to create subjects for departments..

router
    .route('/defaultSubjects')
    .get(auth.protect, auth.restrictTo('super-admin', 'admin'), defaultSubjectController.getAllDefaultSubjects)
    .post(auth.protect, auth.restrictTo('super-admin'), defaultSubjectController.createDefaultSubject);

router
    .route('/defaultSubjects/:id')
    .get(auth.protect, auth.restrictTo('super-admin'), defaultSubjectController.getDefaultSubject)
    .patch(auth.protect, auth.restrictTo('super-admin'), defaultSubjectController.updateDefaultSubject)
    .delete(auth.protect, auth.restrictTo('super-admin'), defaultSubjectController.deleteDefaultSubject);

// Subjects in a semester
// url = /subjects?semester=123456789
router
    .route('/')
    .get(auth.protect, subjectController.getAllSubjects)
    .post(auth.protect, auth.restrictTo('admin'), auth.checkSemesterPermission, subjectController.createSubject);

// for admin and super admin to get teacher subject list
router
    .route('/get/teacher-subjects/:id')
    .get(auth.protect, auth.restrictTo('admin', 'super-admin'), subjectController.getTeachersSubjects);

// for teacher to get his own subjects list
router
    .route('/get/teacher-subjects')
    .get(auth.protect, auth.restrictTo('teacher'), subjectController.getTeacherSubjects);

// function where teacher remove subject from his list
router.patch(
    '/remove/teacher-subjects/:id',
    auth.protect,
    auth.restrictTo('teacher'),
    auth.checkSubjectTeacher,
    subjectController.removeSubjectFromTeacher,
    subjectController.updateSubject
);

// Subject CRUD functions
router
    .route('/:id')
    .get(auth.protect, subjectController.getSubject)
    .patch(auth.protect, auth.restrictTo('admin'), auth.checkSubjectPermission, subjectController.updateSubject)
    .delete(auth.protect, auth.restrictTo('admin'), auth.checkSubjectPermission, subjectController.deleteSubject);

module.exports = router;
