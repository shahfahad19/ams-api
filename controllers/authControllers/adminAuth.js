const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const Admin = require('./../../models/adminModel');
const catchAsync = require('./../../utils/catchAsync');
const AppError = require('./../../utils/appError');
const sendEmail = require('./../../utils/email');
const Batch = require('../../models/batchModel');
const Semester = require('../../models/semesterModel');
const Subject = require('../../models/subjectModel');
const Student = require('../../models/studentModel');
const Attendance = require('../../models/attendanceModel');
const shortLink = require('../../utils/link');

const signToken = (id) => {
    return jwt.sign({ id, role: 'admin' }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (admin, statusCode, res) => {
    const token = signToken(admin._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);

    // Remove password from output
    admin.password = undefined;
    admin.confirmationToken = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            admin,
        },
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const admin = await Admin.create({
        name: req.body.name,
        email: req.body.email,
        department: req.body.department,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        createdAt: Date.now(),
    });
    const confirmationToken = admin.createConfirmationToken();
    let link = process.env.HOME_URL + confirmationToken;
    const shortenLink = await shortLink(link);
    if (shortenLink.data.shortLink) link = shortenLink.data.shortLink;
    let message = `<h1>Confirm your account</h1>Here is your confirmation link ${link}`;
    try {
        await sendEmail({
            email: admin.email,
            subject: 'Confirm your account',
            message,
        });
    } catch (err) {}
    await admin.save({ validateBeforeSave: false });
    createSendToken(admin, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }
    // 2) Check if admin exists && password is correct
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin || !(await admin.correctPassword(password, admin.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    // 3) If everything ok, send token to client
    createSendToken(admin, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and check of it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if admin still exists
    const currentAdmin = await Admin.findById(decoded.id);
    if (!currentAdmin) {
        return next(new AppError('The admin belonging to this token does no longer exist.', 401));
    }

    // 4) Check if admin changed password after the token was issued
    if (currentAdmin.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('Admin recently changed password! Please log in again.', 401));
    }

    const ignoreConfirmation = req.body.ignoreConfirmation || false;
    if (currentAdmin.confirmed === false && ignoreConfirmation) {
        return next(new AppError('You need to confirm your account before performing this action', 401));
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.admin = currentAdmin;
    next();
});

exports.ignoreConfirmation = catchAsync(async (req, res, next) => {
    req.ignoreConfirmation = true;
    next();
});

exports.checkBatchPermission = catchAsync(async (req, res, next) => {
    const batch = await Batch.findById(req.params.id);
    if (!batch.adminId.equals(req.admin._id)) return next(new AppError('Batch Not Found', 404));
    next();
});

exports.checkSemesterPermission = catchAsync(async (req, res, next) => {
    const semester = await Semester.findById(req.params.id).populate('batchId');
    if (!semester.batchId.adminId.equals(req.admin._id)) return next(new AppError('Semester Not Found', 404));
    next();
});

exports.checkSubjectPermission = catchAsync(async (req, res, next) => {
    const subject = await Subject.findById(req.params.id).populate({
        path: 'semesterId',
        populate: {
            path: 'batchId',
        },
    });
    if (!subject.semesterId.batchId.adminId.equals(req.admin._id)) return next(new AppError('Subject Not Found', 404));
    next();
});

exports.checkStudentPermission = catchAsync(async (req, res, next) => {
    const student = await Student.findById(req.params.id).populate({
        path: 'batchId',
    });
    if (!student.batchId.adminId.equals(req.admin._id)) return next(new AppError('Student Not Found', 404));
    next();
});

exports.checkAttendancePermission = catchAsync(async (req, res, next) => {
    const attenance = await Attendance.findById(req.params.id).populate({
        path: 'subjectId',
        populate: {
            path: 'semesterId',
            populate: {
                path: 'batchId',
            },
        },
    });
    console.log(req.admin._id);
    if (!attenance.subjectId.semesterId.batchId.adminId.equals(req.admin._id))
        return next(new AppError('Attendance Not Found', 404));
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles ['admin', 'lead-guide']. role='admin'
        if (!roles.includes(req.admin.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }

        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get admin based on POSTed email
    const admin = await Admin.findOne({ email: req.body.email });
    if (!admin) {
        return next(new AppError('There is no admin with email address.', 404));
    }

    // 2) Generate the random reset token
    const resetToken = admin.createPasswordResetToken();
    await admin.save({ validateBeforeSave: false });

    // 3) Send it to admin's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/admins/resetPassword/${resetToken}`;

    const message = `<h1>Forgot your password?</h1>Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
        await sendEmail({
            email: admin.email,
            subject: 'Your password reset token (valid for 10 min)',
            message,
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!',
        });
    } catch (err) {
        admin.passwordResetToken = undefined;
        admin.passwordResetExpires = undefined;
        await admin.save({ validateBeforeSave: false });

        return next(new AppError('There was an error sending the email. Try again later!'), 500);
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get admin based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const admin = await Admin.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired, and there is admin, set the new password
    if (!admin) {
        return next(new AppError('Token is invalid or has expired', 400));
    }
    admin.password = req.body.password;
    admin.passwordConfirm = req.body.passwordConfirm;
    admin.passwordResetToken = undefined;
    admin.passwordResetExpires = undefined;
    await admin.save();

    // 3) Update changedPasswordAt property for the admin
    // 4) Log the admin in, send JWT
    createSendToken(admin, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get admin from collection
    const admin = await Admin.findById(req.admin.id).select('+password');

    // 2) Check if POSTed current password is correct
    if (!(await admin.correctPassword(req.body.passwordCurrent, admin.password))) {
        return next(new AppError('Your current password is wrong.', 401));
    }

    // 3) If so, update password
    admin.password = req.body.password;
    admin.passwordConfirm = req.body.passwordConfirm;
    await admin.save();
    // Admin.findByIdAndUpdate will NOT work as intended!

    // 4) Log admin in, send JWT
    createSendToken(admin, 200, res);
});
