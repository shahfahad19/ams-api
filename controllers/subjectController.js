const Attendance = require('../models/attendanceModel');
const DefaultSubject = require('../models/defaultSubjectModel');
const AppError = require('../utils/appError');
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

exports.getSubject = catchAsync(async (req, res, next) => {
    const subject = await Subject.findById(req.params.id)
        .populate({
            path: 'teacher',
            populate: 'departmentId',
        })
        .populate({
            path: 'semester',
            populate: {
                path: 'batch',
                populate: 'admin',
            },
        })
        .select('-__v');
    if (!subject) {
        return next(new AppError('Subject not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            subject,
        },
    });
});

exports.createSubject = catchAsync(async (req, res, next) => {
    if (!req.query.semester) {
        res.status(400).json({
            status: 'error',
            error: 'Semester Id should be provided',
        });
    }
    const subject = await DefaultSubject.findById(req.body.subject);

    if (!subject) {
        return next(new AppError('Subject does not exist', 404));
    }

    const newSubject = await Subject.create({
        name: subject.name,
        semester: req.query.semester,
        creditHours: subject.creditHours,
        teacher: null,
        archived: false,
        createdAt: Date.now(),
    });
    res.status(201).json({
        status: 'success',
        data: {
            subject: newSubject,
        },
    });
});

exports.updateSubject = catchAsync(async (req, res) => {
    const subject = await Subject.findByIdAndUpdate(
        req.params.id,
        {
            archived: req.body.archived,
            teacher: req.body.teacher,
        },
        {
            new: true,
        }
    )
        .populate({
            path: 'teacher',
            populate: 'departmentId',
        })
        .populate({
            path: 'semester',
            populate: {
                path: 'batch',
            },
        });

    res.status(200).json({
        status: 'success',
        data: {
            subject,
        },
    });
});

exports.deleteSubject = catchAsync(async (req, res, next) => {
    const subjectId = req.params.id;

    // Find the subject document
    const subject = await Subject.findById(subjectId);

    if (!subject) {
        // Subject not found
        return next(new AppError('Subject not found', 404));
    }

    await Attendance.deleteMany({ subject: subjectId });
    await Subject.findByIdAndDelete(subjectId);

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

// getting teacher subjects (to get his/her own subject)
exports.getTeacherSubjects = catchAsync(async (req, res) => {
    const features = new APIFeatures(Subject.find({ teacher: req.user._id, archived: false }), req.query)
        .filter()
        .sort()
        .limit()
        .paginate();

    const subjects = await features.query.populate({
        path: 'semester',
        populate: {
            path: 'batch',
            populate: 'admin',
        },
    });

    const subjectsArr = [];

    subjects.forEach((subject) => {
        subjectsArr.push({
            _id: subject._id,
            name: subject.name,
            creditHours: subject.creditHours,
            semesterName: subject.semester.name,
            batchId: subject.semester.batch._id,
            batchName: subject.semester.batch.name,
            department: subject.semester.batch.admin.department,
        });
    });

    res.status(200).json({
        status: 'success',
        results: subjects.length,
        data: {
            subjects: subjectsArr,
        },
    });
});

exports.removeSubjectFromTeacher = catchAsync(async (req, res, next) => {
    req.body = {
        teacher: null,
    };
    next();
});

// for admin and super admin
exports.getTeachersSubjects = catchAsync(async (req, res) => {
    const subjects = await Subject.find({ teacher: req.params.id, archived: false }).populate({
        path: 'semester',
        populate: {
            path: 'batch',
            populate: 'admin',
        },
    });
    let filteredSubjects = subjects;

    // if (req.user.role === 'admin') {
    //     subjects.forEach((subject) => {
    //         if (subject.semester.batch.admin.equals(req.user._id)) {
    //             filteredSubjects.push(subject);
    //         }
    //     });
    // } else {
    //     filteredSubjects = subjects;
    // }
    const subjectsArr = [];

    filteredSubjects.forEach((subject) => {
        subjectsArr.push({
            _id: subject._id,
            name: subject.name,
            creditHours: subject.creditHours,
            semesterName: subject.semester.name,
            batchId: subject.semester.batch._id,
            batchName: subject.semester.batch.name,
            department: subject.semester.batch.admin.department,
        });
    });

    res.status(200).json({
        status: 'success',
        results: filteredSubjects.length,
        data: {
            subjects: subjectsArr,
        },
    });
});
