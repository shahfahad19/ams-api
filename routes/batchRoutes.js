const express = require('express');
const batchController = require('./../controllers/batchController');
const studentController = require('./../controllers/studentController');
const auth = require('../controllers/authController');

const router = express.Router();

router
    .route('/')
    .get(auth.protect, auth.restrictTo('admin'), batchController.getAllBatches)
    .post(auth.protect, batchController.createBatch);

router
    .route('/:id')
    .get(auth.protect, auth.restrictTo('admin', 'student'), auth.checkBatchPermission, batchController.getBatch)
    .patch(auth.protect, auth.restrictTo('admin'), auth.checkBatchPermission, batchController.updateBatch)
    .delete(auth.protect, auth.restrictTo('admin'), auth.checkBatchPermission, batchController.deleteBatch);

router.get(
    '/:id/updatecode',
    auth.protect,
    auth.restrictTo('admin'),
    auth.checkBatchPermission,
    batchController.updateBatchCode
);

router.get(
    '/:id/students',
    auth.restrictTo('admin'),
    auth.protect,
    auth.checkBatchPermission,
    studentController.getAllStudents
);

module.exports = router;
