const catchAsync = require('../utils/catchAsync');
const Subject = require('./../models/subjectModel');
const APIFeatures = require('./../utils/apiFeatures');

exports.getAllSubjects = catchAsync(async (req, res) => {
    if (!req.query.semester) {
        res.status(400).json({
            status: 'error',
            error: 'Semester Id should be provided',
        });
    }
    const features = new APIFeatures(Subject.find({ semester: req.query.semester }), req.query)
        .filter()
        .sort()
        .limit()
        .paginate();

    const subjects = await features.query.populate('teacher');

    let subjectsArray = [];

    // subjects.forEach((subject, i) => {
    //     //if (subject.semester.batch.admin.equals(req.user._id))
    //     subjectsArray.push({
    //         _id: subject._id,
    //         name: subject.name,
    //         teacherId: subject.teacher._id,
    //         teacherName: subject.teacher.name,
    //         semesterId: subject.semester._id,
    //         semesterName: subject.semester.name,
    //         batchId: subject.semester.batch._id,
    //         batchName: subject.semester.batch.name,
    //         department: subject.semester.batch.admin.department,
    //     });
    // });

    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        results: subjects.length,
        data: {
            subjects: subjects,
        },
    });
});

exports.getSubject = catchAsync(async (req, res) => {
    const subject = await Subject.findById(req.params.id)
        .populate('teacher')
        .populate({
            path: 'semester',
            populate: {
                path: 'batch',
            },
        })
        .select('-__v');

    res.status(200).json({
        status: 'success',
        data: {
            subject,
        },
    });
});

exports.createSubject = catchAsync(async (req, res) => {
    if (!req.query.semester) {
        res.status(400).json({
            status: 'error',
            error: 'Semester Id should be provided',
        });
    }
    const newSubject = await Subject.create({
        name: req.body.name,
        semester: req.query.semester,
        createdAt: Date.now(),
    });
    res.status(201).json({
        status: 'success',
        data: {
            Subject: newSubject,
        },
    });
});

exports.updateSubject = catchAsync(async (req, res) => {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    }).populate('teacher');

    res.status(200).json({
        status: 'success',
        data: {
            subject,
        },
    });
});

exports.deleteSubject = catchAsync(async (req, res) => {
    await Subject.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

// getting teacher subjects
exports.getTeacherSubjects = catchAsync(async (req, res) => {
    const features = new APIFeatures(Subject.find({ teacher: req.user, archived: false }), req.query)
        .filter()
        .sort()
        .limit()
        .paginate();

    const subjects = await features.query;

    res.status(200).json({
        status: 'success',
        results: subjects.length,
        data: {
            subjects: subjects,
        },
    });
});
