const catchAsync = require('../utils/catchAsync');
const crypto = require('crypto');
const User = require('./../models/userModel');
const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('../utils/appError');
const { sendEmailToDepartment } = require('../utils/email');
const Batch = require('../models/batchModel');
const Semester = require('../models/semesterModel');
const Subject = require('../models/subjectModel');
const Attendance = require('../models/attendanceModel');
const DefaultSubject = require('../models/defaultSubjectModel');

exports.getAllDepartments = catchAsync(async (req, res) => {
    const features = new APIFeatures(User.find({ role: 'admin' }), req.query).filter().sort().limit().paginate();
    const departments = await features.query;

    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        results: departments.length,
        data: {
            departments,
        },
    });
});

exports.createDepartment = catchAsync(async (req, res, next) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let rndPass = '';

    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        rndPass += characters.charAt(randomIndex);
    }
    const userData = {
        name: 'Not Set Yet',
        email: req.body.email,
        role: 'admin',
        department: req.body.department,
        password: rndPass,
        passwordConfirm: rndPass,
        confirmed: true,
        approved: false,
        createdAt: Date.now(),
    };

    const user = await User.create(userData);

    // SENDING EMAIL
    try {
        await sendEmailToDepartment({
            email: req.body.email,
            subject: 'Approve your account at AMS',
            department: req.body.department,
            password: rndPass,
        });
    } catch (err) {
        console.log(err);
    }
    user.confirmed = true;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'success',
        message: 'Department added successfully!',
    });
});

exports.getDepartment = catchAsync(async (req, res, next) => {
    const department = await User.findById(req.params.id);
    if (!department) {
        return next(new AppError('Department not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            department,
        },
    });
});

exports.updateEmail = catchAsync(async (req, res, next) => {
    const existingUser = await User.find(req.params.email);

    if (existingUser.email === req.body.email) {
        return next(new AppError('Email exist already.', 400));
    }

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let rndPass = '';

    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        rndPass += characters.charAt(randomIndex);
    }

    const data = {
        name: 'Not Set Yet',
        email: req.body.email,
        password: rndPass,
        photo: 'https://res.cloudinary.com/dbph73rvi/image/upload/v1675170781/mdqcinla4xkogsatvbr3.jpg',
        approved: false,
    };
    const user = await User.findByIdAndUpdate(req.params.id, data, {
        new: true,
    });
    user.password = rndPass;
    user.passwordConfirm = rndPass;

    await user.save();
    // SENDING EMAIL
    try {
        await sendEmailToDepartment({
            email: req.body.email,
            subject: 'Approve your account at AMS',
            department: user.department,
            password: rndPass,
        });
    } catch (err) {
        console.log(err);
    }

    res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    });
});

exports.deleteDepartment = catchAsync(async (req, res) => {
    const departmentId = req.params.id;

    // Find the department document
    const department = await User.findById(departmentId);

    if (!department) {
        // Department not found
        return next(new AppError('Department not found', 404));
    }

    // Find all batches with the departmentId as admin
    const batches = await Batch.find({ admin: departmentId });

    // Delete batches, users, semesters, subjects, and attendances
    await Promise.all(
        batches.map(async (batch) => {
            // deleting student of this batch
            await User.deleteMany({ batch: batch._id });

            const semesters = await Semester.find({ batch: batch._id });

            await Promise.all(
                semesters.map(async (semester) => {
                    const subjects = await Subject.find({ semester: semester._id });

                    await Promise.all(
                        subjects.map(async (subject) => {
                            await subject.remove();
                            await Attendance.deleteMany({ subject: subject._id });
                        })
                    );

                    await semester.remove();
                })
            );

            await batch.remove();
        })
    );

    // adding subjects created by super admin
    await DefaultSubject.deleteMany({ department: departmentId });

    await User.deleteMany({ department: departmentId });

    // Delete the department document
    await department.remove();

    res.status(204).json({
        status: 'success',
        data: null,
    });
});
