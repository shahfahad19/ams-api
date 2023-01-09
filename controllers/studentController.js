const catchAsync = require('../utils/catchAsync');
const Student = require('./../models/studentModel');
const APIFeatures = require('./../utils/apiFeatures');

exports.getAllStudents = catchAsync(async (req, res) => {
    const features = new APIFeatures(Student.find(), req.query).filter().sort().limit().paginate();
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

exports.getStudent = catchAsync(async (req, res) => {
    const student = await Student.findById(req.params.id);

    res.status(200).json({
        status: 'success',
        data: {
            student,
        },
    });
});

exports.createStudent = catchAsync(async (req, res) => {
    const newStudent = await Student.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            Student: newStudent,
        },
    });
});

exports.updateStudent = catchAsync(async (req, res) => {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
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
    await Student.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: 'success',
        data: null,
    });
});
