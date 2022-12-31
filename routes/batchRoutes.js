const express = require('express');
const batchController = require('./../controllers/batchController');

const router = express.Router();

router.route('/').get(batchController.getAllBatches).post(batchController.createBatch);

router
    .route('/:id')
    .get(batchController.getBatch)
    .patch(batchController.updateBatch)
    .delete(batchController.deleteBatch);

module.exports = router;
