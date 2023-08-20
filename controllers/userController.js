const catchAsync = require('../utils/catchAsync');
const User = require('./../models/userModel');
const AppError = require('../utils/appError');
const validator = require('validator');
const { resendConfirmationEmail, sendTokenToNewEmail, sendTokenToOldEmail } = require('./../utils/email');
const shortLink = require('./../utils/link');
const crypto = require('crypto');
const APIFeatures = require('./../utils/apiFeatures');

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

        const existingUserWithEmail = await User.findOne({ email: req.body.email });
        if (existingUserWithEmail) return next(new AppError('Email is already in use'), 400);

        const token = updatedUser.createNewEmailToken();
        // Confirmation link
        let link = `https://amsapp.vercel.app/confirm-email/?token=${token}`;
        const shortenLink = await shortLink(link);
        if (shortenLink.data.shortLink) link = shortenLink.data.shortLink;

        // removal link
        let removalLink = `https://amsapp.vercel.app/remove-email/?token=${token}`;
        const shortenRemovalLink = await shortLink(removalLink);
        if (shortenRemovalLink.data.shortLink) removalLink = shortenRemovalLink.data.shortLink;

        updatedUser.newEmail = req.body.email;

        // SENDING EMAIL
        await sendTokenToNewEmail({
            email: req.body.email,
            name: updatedUser.name,
            confirmationLink: link,
        });

        await sendTokenToOldEmail({
            email: updatedUser.email,
            name: updatedUser.name,
            removalLink: removalLink,
            userID: updatedUser._id,
        });
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

// exports.search = catchAsync(async (req, res, next) => {
//     const searchData = {
//         role: req.body.role,
//         req.body.query: req.body.search_by,
//         query: req.body.query,
//     };

//     if (searchData.role !== 'student' && searchData.role !== 'teacher') return next(new AppError('No results', 400));
//     if (searchData.search_by !== 'rollNo' && searchData.role !== 'name' && searchData.role !== 'email')
//         return next(new AppError('No results', 400));

//     let users;
//     if (req.user.role === 'admin') {
//         if (searchData.role === 'student') {
//             users = await User.find(searchData).populate({
//                 path: 'batch',
//                 populate: {
//                     path: 'department',
//                     match: { _id: desiredDepartmentId }, // Filtering by the desired department ID
//                 },
//             });
//         }
//     }
// });

exports.getUsers = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(User.find(), req.query).filter().sort().limit().paginate();
    const users = await features.query
        .populate({
            path: 'batch',
            populate: 'admin',
        })
        .populate('departmentId');

    if (req.user.role === 'admin') {
        let filteredUsers = [];

        if (req.query.role === 'student') {
            filteredUsers = users.filter((student) => student.batch.admin._id.equals(req.user._id));
            if (filteredUsers.length === 0) return next(new AppError('No students found', 404));
        } else if (req.query.role === 'teacher') {
            filteredUsers = users.filter((teacher) => teacher.departmentId._id.equals(req.user._id));
            if (filteredUsers.length === 0) return next(new AppError('No teachers found', 404));
        }

        // SEND RESPONSE
        return res.status(200).json({
            status: 'success',
            results: filteredUsers.length,
            data: {
                users: filteredUsers,
            },
        });
    }

    if (users.length === 0) return next(new AppError('No users found', 404));

    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users,
        },
    });
});

exports.confirmEmail = catchAsync(async (req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        newEmailToken: hashedToken,
    });

    // 2) If token has not expired,
    if (!user) {
        return next(new AppError('Token is invalid', 400));
    }

    if (!user._id(req.user._id)) {
        return next(new AppError('Login from your account and reopen the link', 400));
    }

    user.newEmailToken = undefined;
    user.email = user.newEmail;
    user.newEmail = undefined;

    await user.save({ validateBeforeSave: false });
    res.status(200).json({
        status: 'success',
        message: 'Email has been confirmed!',
    });
});

exports.removeEmail = catchAsync(async (req, res, next) => {
    if (req.params.token === 'fromProfile') {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findById(req.user._id);

        user.newEmailToken = undefined;
        user.newEmail = undefined;

        await user.save({ validateBeforeSave: false });
        res.status(200).json({
            status: 'success',
            message: 'Email has been removed!',
        });
    } else {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({
            newEmailToken: hashedToken,
        });

        // 2) If token has not expired, confirm account
        if (!user) {
            return next(new AppError('Token is invalid', 400));
        }

        if (!user._id(req.user._id)) {
            return next(new AppError('Login from your account and reopen the link', 400));
        }

        user.newEmailToken = undefined;
        user.newEmail = undefined;

        await user.save({ validateBeforeSave: false });
        res.status(200).json({
            status: 'success',
            message: 'Email has been removed!',
        });
    }
});
