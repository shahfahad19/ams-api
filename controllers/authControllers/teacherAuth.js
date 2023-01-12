const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const Teacher = require('./../../models/teacherModel');
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
    return jwt.sign({ id, role: 'teacher' }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (teacher, statusCode, res) => {
    const token = signToken(teacher._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);

    // Remove password from output
    teacher.password = undefined;
    teacher.confirmationToken = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            teacher,
        },
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const teacher = await Teacher.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        createdAt: Date.now(),
    });
    const confirmationToken = teacher.createConfirmationToken();
    let link = process.env.HOME_URL + '/teacher/confirmAccount/' + confirmationToken;
    const shortenLink = await shortLink(link);
    if (shortenLink.data.shortLink) link = shortenLink.data.shortLink;
    let message = `<h1>Confirm your account</h1>Here is your confirmation link ${link}`;
    try {
        await sendEmail({
            email: teacher.email,
            subject: 'Confirm your account',
            message,
        });
    } catch (err) {
        console.log(err);
    }
    await teacher.save({ validateBeforeSave: false });
    createSendToken(teacher, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }
    // 2) Check if teacher exists && password is correct
    const teacher = await Teacher.findOne({ email }).select('+password');

    if (!teacher || !(await teacher.correctPassword(password, teacher.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    // 3) If everything ok, send token to client
    createSendToken(teacher, 200, res);
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

    // 3) Check if teacher still exists
    const currentTeacher = await Teacher.findById(decoded.id);
    if (!currentTeacher) {
        return next(new AppError('The teacher belonging to this token does no longer exist.', 401));
    }

    // 4) Check if teacher changed password after the token was issued
    if (currentTeacher.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('Teacher recently changed password! Please log in again.', 401));
    }

    const ignoreConfirmation = req.body.ignoreConfirmation || false;
    if (currentTeacher.confirmed === false && ignoreConfirmation) {
        return next(new AppError('You need to confirm your account before performing this action', 401));
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.teacher = currentTeacher;
    next();
});

exports.ignoreConfirmation = catchAsync(async (req, res, next) => {
    req.ignoreConfirmation = true;
    next();
});

exports.checkSubjectPermission = catchAsync(async (req, res, next) => {
    const subject = await Subject.findById(req.params.id).populate({
        path: 'semesterId',
        populate: {
            path: 'batchId',
        },
    });
    if (!subject.teacherId.equals(req.teacher._id)) return next(new AppError('Subject Not Found', 404));
    if (subject.archived === true) return next(new AppError('Subject is Archived', 401));
    if (subject.semesterId.archived === true) return next(new AppError('Semester is Archived', 401));
    if (subject.semesterId.batchId.archived === true) return next(new AppError('Batch is Archived', 401));
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles ['teacher', 'lead-guide']. role='teacher'
        if (!roles.includes(req.teacher.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }

        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get teacher based on POSTed email
    const teacher = await Teacher.findOne({ email: req.body.email });
    if (!teacher) {
        return next(new AppError('There is no teacher with email address.', 404));
    }

    // 2) Generate the random reset token
    const resetToken = teacher.createPasswordResetToken();
    await teacher.save({ validateBeforeSave: false });

    // 3) Send it to teacher's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/teachers/resetPassword/${resetToken}`;

    const message = `<h1>Forgot your password?</h1>Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
        await sendEmail({
            email: teacher.email,
            subject: 'Your password reset token (valid for 10 min)',
            message,
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!',
        });
    } catch (err) {
        teacher.passwordResetToken = undefined;
        teacher.passwordResetExpires = undefined;
        await teacher.save({ validateBeforeSave: false });

        return next(new AppError('There was an error sending the email. Try again later!'), 500);
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get teacher based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const teacher = await Teacher.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired, and there is teacher, set the new password
    if (!teacher) {
        return next(new AppError('Token is invalid or has expired', 400));
    }
    teacher.password = req.body.password;
    teacher.passwordConfirm = req.body.passwordConfirm;
    teacher.passwordResetToken = undefined;
    teacher.passwordResetExpires = undefined;
    await teacher.save();

    // 3) Update changedPasswordAt property for the teacher
    // 4) Log the teacher in, send JWT
    createSendToken(teacher, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get teacher from collection
    const teacher = await Teacher.findById(req.teacher.id).select('+password');

    // 2) Check if POSTed current password is correct
    if (!(await teacher.correctPassword(req.body.passwordCurrent, teacher.password))) {
        return next(new AppError('Your current password is wrong.', 401));
    }

    // 3) If so, update password
    teacher.password = req.body.password;
    teacher.passwordConfirm = req.body.passwordConfirm;
    await teacher.save();
    // Teacher.findByIdAndUpdate will NOT work as intended!

    // 4) Log teacher in, send JWT
    createSendToken(teacher, 200, res);
});
