const express = require('express');
const adminController = require('./../controllers/adminController');

const router = express.Router();

router.route('/').post(adminController.createAdmin);

router
    .route('/:id')
    .get(adminController.getAdmin)
    .patch(adminController.updateAdmin)
    .delete(adminController.deleteAdmin);

module.exports = router;
