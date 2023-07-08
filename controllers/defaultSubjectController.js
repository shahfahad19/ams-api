const Subject = require('../models/subjectModel');
const catchAsync = require('../utils/catchAsync');
const DefaultSubject = require('./../models/defaultSubjectModel');
const APIFeatures = require('./../utils/apiFeatures');

// getting all subjects of a department
exports.getAllDefaultSubjects = catchAsync(async (req, res) => {
    if (!req.query.department) {
        res.status(400).json({
            status: 'error',
            error: 'Department Id should be provided',
        });
    }
    const department = { department: req.query.department };
    const features = new APIFeatures(DefaultSubject.find(), department).filter().sort().limit().paginate();
    const subjects = await features.query;

    let newSubjects = [];
    if (req.user.role === 'admin') {
        const semesterSubjects = await Subject.find({ semester: req.query.semester });

        const semesterSubjectNames = [];
        semesterSubjects.map((semesterSubject) => {
            semesterSubjectNames.push(semesterSubject.name);
        });

        subjects.map((subject) => {
            if (semesterSubjectNames.indexOf(subject.name) === -1) {
                newSubjects.push(subject);
            }
        });
    } else {
        newSubjects = subjects;
    }

    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        results: subjects.length,
        data: {
            subjects: newSubjects,
        },
    });
});

// getting a single department subject
exports.getDefaultSubject = catchAsync(async (req, res) => {
    const subject = await DefaultSubject.findById(req.params.id);

    res.status(200).json({
        status: 'success',
        data: {
            subject,
        },
    });
});

// creating a new subject
exports.createDefaultSubject = catchAsync(async (req, res) => {
    // if (!req.query.department) {
    //     res.status(400).json({
    //         status: 'error',
    //         error: 'Department Id should be provided',
    //     });
    // }
    const newDefaultSubject = await DefaultSubject.create({
        name: req.body.name,
        department: req.body.department,
        creditHours: req.body.creditHours,
    });
    res.status(201).json({
        status: 'success',
        data: {
            subject: newDefaultSubject,
        },
    });
});

// updating a subject
exports.updateDefaultSubject = catchAsync(async (req, res) => {
    const subject = await DefaultSubject.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });

    res.status(200).json({
        status: 'success',
        data: {
            subject,
        },
    });
});

// deleting a subject
exports.deleteDefaultSubject = catchAsync(async (req, res) => {
    await DefaultSubject.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: 'success',
        data: null,
    });
});
