const catchAsync = require('../utils/catchAsync');
const Teacher = require('./../models/teacherModel');
const APIFeatures = require('./../utils/apiFeatures');

exports.getAllTeachers = catchAsync(async (req, res) => {
    const features = new APIFeatures(Teacher.find(), req.query).filter().sort().limit().paginate();
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

exports.getTeacher = catchAsync(async (req, res) => {
    const teacher = await Teacher.findById(req.params.id);

    res.status(200).json({
        status: 'success',
        data: {
            teacher,
        },
    });
});

exports.createTeacher = catchAsync(async (req, res) => {
    const newTeacher = await Teacher.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            Teacher: newTeacher,
        },
    });
});

exports.updateTeacher = catchAsync(async (req, res) => {
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });

    res.status(200).json({
        status: 'success',
        data: {
            teacher,
        },
    });
});

exports.deleteTeacher = catchAsync(async (req, res) => {
    await Teacher.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: 'success',
        data: null,
    });
});
