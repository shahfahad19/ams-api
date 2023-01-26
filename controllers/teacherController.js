const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('./../utils/apiFeatures');

exports.getAllTeachers = catchAsync(async (req, res) => {
    const features = new APIFeatures(User.find({ role: 'teacher' }), req.query).filter().sort().limit().paginate();
    const teachers = await features.query;
    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        results: teachers.length,
        data: {
            teachers,
        },
    });
});
