const catchAsync = require('../utils/catchAsync');
const Semester = require('./../models/semesterModel');
const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('../utils/appError');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

exports.getAllSemesters = catchAsync(async (req, res) => {
    const features = new APIFeatures(Semester.find({ batchId: req.params.id }), req.query)
        .filter()
        .sort()
        .limit()
        .paginate();
    const semesters = await features.query;

    // let semesterArray = [];

    // semesters.forEach((semester, i) => {
    //     if (semester.batchId.adminId.equals(req.admin._id))
    //         semesterArray[i] = {
    //             _id: semester._id,
    //             name: semester.name,
    //             batchId: semester.batchId._id,
    //             batchName: semester.batchId.name,
    //             department: semester.batchId.adminId.department,
    //         };
    // });
    //        SEND RESPONSE
    res.status(200).json({
        status: 'success',
        results: semesters.length,
        data: {
            semesters,
        },
    });
});

exports.getSemester = catchAsync(async (req, res) => {
    const semester = await Semester.findById(req.params.id).populate('batchId');

    res.status(200).json({
        status: 'success',
        data: {
            semester,
        },
    });
});

exports.createSemester = catchAsync(async (req, res) => {
    const newSemester = await Semester.create({
        name: req.body.name,
        batchId: req.params.id,
        createdAt: Date.now(),
    });
    res.status(201).json({
        status: 'success',
        data: {
            Semester: newSemester,
        },
    });
});

exports.updateSemester = catchAsync(async (req, res) => {
    const semester = await Semester.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    }).populate('batchId');

    res.status(200).json({
        status: 'success',
        data: {
            semester,
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
