const Subject = require('../models/subjectModel');
const Semester = require('../models/semesterModel');

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

    // populating because of breadcrumbs (to get batch name)
    const semester = await Semester.findById(req.query.semester).populate({ path: 'batch', populate: 'admin' });

    let newSubjects = [];
    if (req.user.role === 'admin') {
        // Get all subjects
        const allSubjects = await Subject.find().populate('semester');
        // Filter subjects which are added in this batch and save their names in an array
        const batchSubjectsNames = [];
        allSubjects.map((subject) => {
            if (subject.semester.batch.equals(semester.batch._id)) {
                batchSubjectsNames.push(subject.name);
            }
        });

        // now remove those subjects which are aleady added in this batch
        // this way same subject won't be added in multiple semesters of one batch
        subjects.map((subject) => {
            if (batchSubjectsNames.indexOf(subject.name) === -1) {
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
            semester,
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
