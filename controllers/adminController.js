const catchAsync = require('../utils/catchAsync');
const Admin = require('./../models/adminModel');
const AppError = require('../utils/appError');

// const getUserId = async (req) => {
//     let userid = await promisify(jwt.verify)(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET);
//     return userid.id;
// };

exports.getAdmin = catchAsync(async (req, res, next) => {
    const admin = await Admin.findById(req.admin._id);

    res.status(200).json({
        status: 'success',
        data: {
            admin,
        },
    });
});

exports.getConfirmationToken = catchAsync(async (req, res, next) => {
    const admin = await Admin.findById(req.admin._id);
    if (admin.confirmed === true) return next(new AppError('Account already confirmed', 409));
    const token = admin.createConfirmationToken();
    await admin.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'success',
        token,
    });
});

exports.updateAdmin = catchAsync(async (req, res) => {
    const admin = await Admin.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });

    res.status(200).json({
        status: 'success',
        data: {
            admin,
        },
    });
});

exports.deleteAdmin = catchAsync(async (req, res) => {
    await Admin.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: 'success',
        data: null,
    });
});
