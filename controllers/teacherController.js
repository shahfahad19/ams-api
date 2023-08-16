const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('./../utils/apiFeatures');
const { sendEmailToTeacher } = require('../utils/email');
const mongoose = require('mongoose');
const AppError = require('../utils/appError');
const Subject = require('../models/subjectModel');

exports.addTeacher = catchAsync(async (req, res) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let rndPass = '';

    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        rndPass += characters.charAt(randomIndex);
    }
    const userData = {
        name: req.body.name,
        email: req.body.email,
        role: 'teacher',
        designation: req.body.designation,
        gender: req.body.gender,
        departmentId: req.user._id,
        password: rndPass,
        passwordConfirm: rndPass,
        confirmed: true,
        approved: false,
        createdAt: Date.now(),
    };

    const user = await User.create(userData);

    // SENDING EMAIL
    try {
        await sendEmailToTeacher({
            name: req.body.name,
            email: req.body.email,
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
        message: 'Teacher added successfully!',
    });
});

exports.getAllTeachers = catchAsync(async (req, res) => {
    const data =
        req.user.role === 'super-admin'
            ? {
                  role: 'teacher',
                  departmentId: req.query.dept,
              }
            : { role: 'teacher' };
    const features = new APIFeatures(User.find(data), req.query).filter().sort().limit().paginate();
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

exports.getDepartmentTeachers = catchAsync(async (req, res) => {
    let departmentId = req.user.role === 'admin' ? req.user._id : mongoose.Types.ObjectId(req.query.dept);
    const teachers = await User.aggregate([
        {
            $match: {
                departmentId,
            },
        },
    ]);

    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        results: teachers.length,
        data: {
            teachers,
        },
    });
});

exports.getTeachersByDepartments = catchAsync(async (req, res) => {
    const teachers = await User.aggregate([
        { $match: { role: 'teacher' } },
        {
            $group: {
                _id: '$departmentId',
                teachers: { $push: '$$ROOT' },
            },
        },
        {
            $lookup: {
                from: 'users', // Replace 'users' with the actual collection name of the User model
                localField: '_id',
                foreignField: '_id',
                as: 'department',
            },
        },
        {
            $addFields: {
                departmentName: { $arrayElemAt: ['$department.department', 0] },
            },
        },

        {
            $project: {
                _id: 0,
                department: 0,
                'teachers.department': 0,
                'teachers.password': 0,
                'teachers.departmentId': 0,
                'teachers.createdAt': 0,
            },
        },
        // {
        //     $group: {
        //         _id: null,
        //         department: { $first: '$department.department' },
        //         teachers: { $addToSet: '$$ROOT' },
        //     },
        // },
        // {
        //     $project: {
        //         _id: 0,
        //         'teachers.department': 0,
        //         'teachers.password': 0,
        //         'teachers.createdAt': 0,
        //     },
        // },
    ]);

    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        results: teachers.length,
        data: {
            teachers,
        },
    });
});

exports.getTeacher = catchAsync(async (req, res, next) => {
    const teacher = await User.findById(req.params.id).select('-passwordChangedAt').populate('departmentId');
    if (!teacher) {
        return next(new AppError('Teacher not found', 404));
    }
    if (teacher.role !== 'teacher') return next(new AppError('Teacher not found', 404));

    res.status(200).json({
        status: 'success',
        data: {
            teacher,
        },
    });
});

exports.deleteTeacher = catchAsync(async (req, res, next) => {
    // getting teacher info
    const teacher = await User.findById(req.params.id);

    // checking if user is teacher
    if (teacher.role !== 'teacher') return next(AppError('This user is not a teacher', 400));

    // removing teacher id from all sujects
    await Subject.updateMany(
        { teacher: teacher._is },
        {
            teacher: null,
        }
    );

    // deleting teacher account
    await User.findByIdAndDelete(teacher._id);

    // sending response
    res.status(204).json({
        status: 'success',
        data: null,
    });
});

exports.updateTeacherDesignation = catchAsync(async (req, res, next) => {
    // getting teacher info
    const teacher = await User.findById(req.params.id);

    // checking if user is teacher
    if (teacher.role !== 'teacher') return next(AppError('This user is not a teacher', 400));
    const updatedTeacher = await User.findByIdAndUpdate(
        teacher._id,
        {
            designation: req.body.designation,
        },
        {
            new: true,
        }
    ).populate('departmentId');
    // sending response
    res.status(200).json({
        status: 'success',
        data: {
            teacher: updatedTeacher,
        },
    });
});
