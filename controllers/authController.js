const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const Batch = require('../models/batchModel');
const Semester = require('../models/semesterModel');
const Subject = require('../models/subjectModel');
const Attendance = require('../models/attendanceModel');
const shortLink = require('../utils/link');
const { default: axios } = require('axios');

const signToken = (id) => {
    return jwt.sign({ id, role: 'admin' }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions);

    // Remove password from output
    user.password = undefined;
    user.confirmationToken = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    // FORMATTING DATA
    const userData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        department: undefined,
        rollNo: undefined,
        batch: undefined,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        createdAt: Date.now(),
    };

    // CUSTOM VALIDATION
    if (req.body.role === 'admin') {
        if (req.body.department === undefined) return next(new AppError('Please provide a department name.'), 400);
        userData.department = req.body.department;
        delete userData.rollNo;
        delete userData.batch;
    }

    if (req.body.role === 'student') {
        if (req.body.rollNo === undefined) return next(new AppError('Please provide a roll no.'), 400);
        if (req.body.batchCode === undefined) return next(new AppError('Please provide a batch code.'), 400);
        const batchCode = req.body.batchCode;
        const batch = await Batch.findOne({ batchCode: batchCode }).select('_id');
        if (!batch) {
            return next(new AppError('Batch Code is Invalid'), 401);
        }
        const student = await User.findOne({ role: 'student', batch: batch._id, rollNo: req.body.rollNo });
        if (student) return next(new AppError('A student with this roll no already exists in this batch'));
        userData.rollNo = req.body.rollNo;
        userData.batch = batch._id;
        delete userData.department;
    }

    if (req.body.role === 'teacher') {
        delete userData.department;
        delete userData.rollNo;
        delete userData.batch;
    }
    // CUSTOM VALIDATION ENDS

    const user = await User.create(userData);
    const confirmationToken = user.createConfirmationToken();

    //confirmation link
    let link = `https://amsapp.vercel.app/confirmAccount/?token=${confirmationToken}`;
    const shortenLink = await shortLink(link);
    if (shortenLink.data.shortLink) link = shortenLink.data.shortLink;

    //deletion link
    let deleteLink = `https://amsapp.vercel.app/deleteAccount/?token=${confirmationToken}`;
    const shortendeleteLink = await shortLink(deleteLink);
    if (shortendeleteLink.data.shortLink) deleteLink = shortendeleteLink.data.shortLink;

    // SENDING EMAIL
    try {
        await sendEmail({
            email: user.email,
            subject: 'Confirm your account',
            name: user.name,
            links: {
                link,
                deleteLink,
            },
        });
    } catch (err) {}
    await user.save({ validateBeforeSave: false });
    createSendToken(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }
    // 2) Check if userexists && password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    // 3) If everything ok, send token to client
    createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and check of it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('The user belonging to this token does no longer exist.', 401));
    }

    // 4) Check if userchanged password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! Please log in again.', 401));
    }

    const ignoreConfirmation = req.body.ignoreConfirmation || false;
    if (currentUser.confirmed === false && ignoreConfirmation) {
        return next(new AppError('You need to confirm your account before performing this action', 401));
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};

exports.ignoreConfirmation = catchAsync(async (req, res, next) => {
    req.ignoreConfirmation = true;
    next();
});

exports.checkBatchPermission = catchAsync(async (req, res, next) => {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return next(new AppError('Batch Not Found', 404));
    if (!batch.admin.equals(req.user._id)) return next(new AppError('Batch Not Found', 404));
    next();
});

exports.checkSemesterPermission = catchAsync(async (req, res, next) => {
    const semester = await Semester.findById(req.params.id).populate('batch');
    if (!semester) return next(new AppError('Semester Not Found', 404));
    if (!semester.batch.admin.equals(req.user._id)) return next(new AppError('Semester Not Found', 404));
    next();
});

exports.checkSubjectPermission = catchAsync(async (req, res, next) => {
    const subject = await Subject.findById(req.params.id).populate({
        path: 'semester',
        populate: {
            path: 'batch',
        },
    });
    if (!subject) return next(new AppError('Subject Not Found', 404));
    if (!subject.semester.batch.admin.equals(req.user._id)) return next(new AppError('Subject Not Found', 404));
    next();
});

exports.checkStudentPermission = catchAsync(async (req, res, next) => {
    const student = await User.findOne({ role: 'student', _id: req.params.id }).populate({
        path: 'batch',
    });
    if (!student) return next(new AppError('Student Not Found', 404));
    if (!student.batch.admin.equals(req.user._id)) return next(new AppError('Student Not Found', 404));
    next();
});

exports.checkAttendancePermission = catchAsync(async (req, res, next) => {
    const attenance = await Attendance.findById(req.params.id).populate({
        path: 'subject',
        populate: {
            path: 'semester',
            populate: {
                path: 'batch',
            },
        },
    });
    if (!attenance.subject.semester.batch.admin.equals(req.user._id))
        return next(new AppError('Attendance Not Found', 404));
    next();
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get userbased on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with email address.', 404));
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send it to admin's email
    const resetURL = `https://amsapp.vercel.app/resetPassword/${resetToken}`;

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
    // 1) Get userbased on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) Update changedPasswordAt property for the user
    // 4) Log the userin, send JWT
    createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get userfrom collection
    const user = await User.findById(req.admin.id).select('+password');

    // 2) Check if POSTed current password is correct
    if (!(await admin.correctPassword(req.body.passwordCurrent, admin.password))) {
        return next(new AppError('Your current password is wrong.', 401));
    }

    // 3) If so, update password
    admin.password = req.body.password;
    admin.passwordConfirm = req.body.passwordConfirm;
    await admin.save();
    // User.findByIdAndUpdate will NOT work as intended!

    // 4) Log userin, send JWT
    createSendToken(admin, 200, res);
});

exports.verifyCaptcha = catchAsync(async (req, res, next) => {
    if (process.env.NODE_ENV === 'development') return next();
    const secret = process.env.RECAPTCHA_KEY;
    const response = req.query.token;
    const verify = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify`,
        {
            secret: secret,
            response,
        },
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
            },
        }
    );
    if (verify.data.success) next();
    else next(new AppError('ReCaptcha Verification Failed', 403));
});
