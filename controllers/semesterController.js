const catchAsync = require('../utils/catchAsync');
const Semester = require('./../models/semesterModel');
const APIFeatures = require('./../utils/apiFeatures');

exports.getAllSemesters = catchAsync(async (req, res) => {
    if (!req.query.batch) {
        res.status(400).json({
            status: 'error',
            error: 'Batch Id should be provided',
        });
    }
    const features = new APIFeatures(Semester.find({ batch: req.query.batch }), req.query)
        .filter()
        .sort()
        .limit()
        .paginate();
    const semesters = await features.query.populate('batch');

    // let semesterArray = [];

    // semesters.forEach((semester, i) => {
    //     if (semester.batch.admin.equals(req.user._id))
    //         semesterArray[i] = {
    //             _id: semester._id,
    //             name: semester.name,
    //             batch: semester.batch._id,
    //             batchName: semester.batch.name,
    //             department: semester.batch.admin.department,
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
    const semester = await Semester.findById(req.params.id).populate('batch');

    res.status(200).json({
        status: 'success',
        data: {
            semester,
        },
    });
});

exports.createSemester = catchAsync(async (req, res) => {
    if (!req.query.batch) {
        res.status(400).json({
            status: 'error',
            error: 'Batch Id should be provided',
        });
    }
    const newSemester = await Semester.create({
        name: req.body.name,
        batch: req.query.batch,
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
    }).populate('batch');

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
