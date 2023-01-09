const catchAsync = require('../utils/catchAsync');
const Semester = require('./../models/semesterModel');
const APIFeatures = require('./../utils/apiFeatures');

exports.getAllSemesters = catchAsync(async (req, res) => {
    const features = new APIFeatures(Semester.find(), req.query).filter().sort().limit().paginate();
    const semesters = await features.query
        .populate({
            path: 'batchId',
            populate: 'adminId',
        })
        .select('-__v');

    let semesterArray = [];

    semesters.forEach((semester, i) => {
        semesterArray[i] = {
            _id: semester._id,
            name: semester.name,
            batchId: semester.batchId._id,
            batchName: semester.batchId.name,
            department: semester.batchId.adminId.department,
        };
    });
    //        SEND RESPONSE
    res.status(200).json({
        status: 'success',
        results: semesters.length,
        data: {
            semesters: semesterArray,
        },
    });
});

exports.getSemester = catchAsync(async (req, res) => {
    const student = await Semester.findById(req.params.id);

    res.status(200).json({
        status: 'success',
        data: {
            student,
        },
    });
});

exports.createSemester = catchAsync(async (req, res) => {
    const newSemester = await Semester.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            Semester: newSemester,
        },
    });
});

exports.updateSemester = catchAsync(async (req, res) => {
    const student = await Semester.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });

    res.status(200).json({
        status: 'success',
        data: {
            student,
        },
    });
});

exports.deleteSemester = catchAsync(async (req, res) => {
    await Semester.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: 'success',
        data: null,
    });
});
