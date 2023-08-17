const catchAsync = require('../utils/catchAsync');
const User = require('./../models/userModel');
const AppError = require('../utils/appError');
const validator = require('validator');
const { resendConfirmationEmail } = require('./../utils/email');
const shortLink = require('./../utils/link');
const crypto = require('crypto');

exports.getUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        return next(new AppError('User not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    });
});

exports.getConfirmationToken = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    if (user.confirmed === true) return next(new AppError('Account already confirmed', 409));

    const token = user.createConfirmationToken();
    // Confirmation link
    let link = `https://amsapp.vercel.app/confirm-account/?token=${token}`;
    const shortenLink = await shortLink(link);
    if (shortenLink.data.shortLink) link = shortenLink.data.shortLink;

    // SENDING EMAIL
    try {
        await resendConfirmationEmail({
            email: user.email,
            name: user.name,
            confirmationLink: link,
        });
        console.log('email sent');

        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            status: 'success',
            message: 'Confirmation link sent to email!',
        });
    } catch (err) {
        return next(new AppError('An error occured while sending the email.', 500));
    }
});

exports.confirmAccount = catchAsync(async (req, res, next) => {
    // 1) Get admin based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        confirmationToken: hashedToken,
    });

    // 2) If token has not expired, confirm account
    if (!user) {
        return next(new AppError('Token is invalid or account is already confirmed', 400));
    }

    user.confirmationToken = undefined;
    user.confirmed = true;
    await user.save({ validateBeforeSave: false });
    res.status(200).json({
        status: 'success',
        message: 'Account has been confirmed!',
    });
});

exports.deleteNonConfirmedAccount = catchAsync(async (req, res, next) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    //console.log(hashedToken);
    const admin = await User.findOne({
        confirmationToken: hashedToken,
    });

    // 2) If token has not expired, confirm account
    if (!admin) {
        return next(new AppError('Token is invalid or account is already confirmed.', 400));
    }

    await admin.delete();
    res.status(204).json({
        status: 'success',
        data: null,
    });
});

exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password updates.', 400));
    }
    // 3) Update user document
    const updatedUser = await User.findById(req.user._id);

    if (req.body.email) {
        if (!validator.isEmail(req.body.email)) return next(new AppError('Email is invalid'), 400);

        updatedUser.email = req.body.email;
    }
    if (req.body.name) {
        updatedUser.name = req.body.name;
    }
    if (req.body.department) {
        updatedUser.department = req.body.department;
    }
    if (req.body.photo) {
        updatedUser.photo = req.body.photo;
    }
    await updatedUser.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser,
        },
    });
});

// exports.updateImage = catchAsync(async (req, res, next) => {
//     const file = req.file;
//     firebase.initializeApp({
//         apiKey: 'AIzaSyBGQErpxps_ZpBF20BVKgEmv8TGglLOnz4',
//         authDomain: 'ams-fyp.firebaseapp.com',
//         projectId: 'ams-fyp',
//         storageBucket: 'ams-fyp.appspot.com',
//         messagingSenderId: '860007240274',
//         appId: '1:860007240274:web:5ba16ab26f88e6aa8fc58b',
//         measurementId: 'G-62X1PX4LKP',
//     });
//     const bucket = firebase.storage().bucket();
//     const fileName = file.originalname;
//     const fileUpload = bucket.file(fileName);
//     const blobStream = fileUpload.createWriteStream({
//         metadata: {
//             contentType: file.mimetype,
//         },
//     });

//     const image = sharp(file.buffer);
//     const resizedImage = await image
//         .resize(250, 250, {
//             fit: 'cover',
//             position: 'center',
//         })
//         .toBuffer();

//     blobStream.on('error', (err) => {
//         console.error(err);
//         res.status(500).send('Error uploading image');
//     });

//     blobStream.on('finish', async () => {
//         const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${fileUpload.name}?alt=media`;
//         res.send({ imageUrl });
//     });

//     blobStream.end(resizedImage);
// });

exports.updateImage = catchAsync(async (req, res, next) => {
    console.log(req.file);
    if (!req.file) return next(new AppError('Image not found', 400));
    const user = await User.findById(req.user._id);
    if (!user.confirmed) return next(new AppError('Please confirm your account first!', 403));
    user.photo = req.file.path;
    user.photoUpdatedAt = Date.now();
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'success',
        message: 'Image updated successfully',
        data: {
            user,
        },
    });
});

exports.completeSignup = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (req.user.role === 'teacher') {
        user.name = req.body.name;
        user.gender = req.body.gender;
        user.approved = true;
        user.confirmed = true;
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
    } else if (req.user.role === 'admin') {
        user.name = req.body.name;
        user.approved = true;
        user.confirmed = true;
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
    }

    await user.save();

    res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully',
    });
});
