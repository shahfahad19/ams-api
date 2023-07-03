const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('./../utils/apiFeatures');
const { sendEmailToTeacher } = require('../utils/email');

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
        departmentId: req.body.departmentId,
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
        message: 'Teacher added successfully!',
    });
});

exports.getAllTeachers = catchAsync(async (req, res) => {
    const features = new APIFeatures(User.find({ role: 'teacher' }), req.query).filter().sort().limit().paginate();
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
    let departmentId = req.user._id;
    const features = new APIFeatures(
        User.find({
            departmentId,
        }).select('-departmentId'),
        req.query
    )
        .filter()
        .sort()
        .limit()
        .paginate();
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

exports.getTeachersByDepartments = catchAsync(async (req, res) => {
    const teachers = await User.aggregate([
        { $match: { role: 'teacher' } },
        {
            $lookup: {
                from: 'users',
                localField: 'departmentId',
                foreignField: '_id',
                as: 'department',
            },
        },
        { $unwind: '$department' },
        {
            $group: {
                _id: null,
                department: { $first: '$department.department' },
                teachers: { $addToSet: '$$ROOT' },
            },
        },
        {
            $project: {
                _id: 0,
                'teachers.department': 0,
                'teachers.password': 0,
                'teachers.createdAt': 0,
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
