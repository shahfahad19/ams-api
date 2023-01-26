const catchAsync = require('../utils/catchAsync');
const shortLink = require('../utils/link');
const APIFeatures = require('./../utils/apiFeatures');
const crypto = require('crypto');
const { getStudentAttendance } = require('./attendanceController');
const User = require('../models/userModel');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

exports.getAllStudents = catchAsync(async (req, res) => {
    const features = new APIFeatures(User.find({ batchId: req.params.id }), req.query)
        .filter()
        .sort()
        .limit()
        .paginate();
    const students = await features.query;
    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        results: students.length,
        data: {
            students,
        },
    });
});

exports.updateStudent = catchAsync(async (req, res) => {
    const filteredObj = filterObj(req.body, 'rollNo', 'name');
    const student = await User.findByIdAndUpdate(req.params.id, filteredObj, {
        new: true,
    });
    res.status(200).json({
        status: 'success',
        data: {
            student,
        },
    });
});

exports.deleteStudent = catchAsync(async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.status(204).json({
        status: 'success',
        data: null,
    });
});
