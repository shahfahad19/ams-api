const catchAsync = require('../utils/catchAsync');
const shortLink = require('../utils/link');
const APIFeatures = require('./../utils/apiFeatures');
const crypto = require('crypto');
const { getStudentAttendance } = require('./attendanceController');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

exports.getAllStudents = catchAsync(async (req, res) => {
    if (!req.query.batch) {
        res.status(400).json({
            status: 'error',
            error: 'Batch Id should be provided',
        });
    }
    const features = new APIFeatures(User.find({ batch: req.query.batch }), req.query)
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

exports.updateStudent = catchAsync(async (req, res, next) => {
    const studentInfo = await User.findById(req.params.id);

    const filteredObj = filterObj(req.body, 'rollNo', 'name', 'registrationNo');
    const existingStudent = await User.findOne({ role: 'student', batch: studentInfo.batch, rollNo: req.body.rollNo });

    // check if student with updated roll no exists
    if (existingStudent) {
        // get current student and existing student ids
        const currentStudentId = studentInfo._id;
        const existingStudentId = existingStudent._id;

        // if they don't match it means they are different students
        if (!currentStudentId.equals(existingStudentId)) {
            // check if existing student has his account confirmed or not
            if (existingStudent.confirmed)
                return next(new AppError('A student with this roll no already exists in this batch'));
            // if not confirmed, set his roll no to zero
            else {
                existingStudent.rollNo = -1;
                await existingStudent.save({ validateBeforeSave: false });
            }
        }
    }

    const student = await User.findByIdAndUpdate(req.params.id, filteredObj, {
        new: true,
    }).populate('batch');
    res.status(200).json({
        status: 'success',
        data: {
            student,
        },
    });
});

exports.deleteStudent = catchAsync(async (req, res, next) => {
    await User.findByIdAndDelete(req.params.id);
    res.status(204).json({
        status: 'success',
        data: null,
    });
});

exports.getStudent = catchAsync(async (req, res) => {
    const student = await User.findById(req.params.id).populate({
        path: 'batch',
        populate: 'admin',
    });
    if (!student) {
        return next(new AppError('Student not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            student,
        },
    });
});
