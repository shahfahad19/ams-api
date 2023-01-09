const catchAsync = require('../utils/catchAsync');
const Batch = require('./../models/batchModel');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('../utils/appError');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

const getAdminID = async (req) => {
    let adminId = await promisify(jwt.verify)(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET);
    return adminId.id;
};

exports.getAllBatches = catchAsync(async (req, res) => {
    let adminId = await getAdminID(req);
    const features = new APIFeatures(Batch.find(), req.query)
        .filter()
        .sort()
        .limit('id', 'name', 'batchCode')
        .paginate();
    const batches = await features.query.populate('adminId');

    let batchArray = [];

    batches.forEach((batch, i) => {
        if (batch.adminId._id.toString() === adminId)
            batchArray.push({
                _id: batch._id,
                name: batch.name,
                department: batch.adminId.department,
            });
    });

    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        results: batches.length,
        data: {
            batches: batchArray,
        },
    });
});

exports.createBatch = catchAsync(async (req, res) => {
    const adminId = await promisify(jwt.verify)(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET);
    const batch = {
        adminId: adminId.id,
        name: req.body.name,
        batchCode: req.body.batchCode,
        createdAt: Date.now(),
    };
    const newBatch = await Batch.create(batch);
    res.status(201).json({
        status: 'success',
        data: {
            Batch: newBatch,
        },
    });
});

exports.getBatch = catchAsync(async (req, res, next) => {
    const batch = await Batch.findById(req.params.id);
    const adminId = await getAdminID(req);

    // If this batch doesn't belong to the admin, return error
    if (batch.adminId.toString() !== adminId) return next(new AppError('Batch not found', 404));
    res.status(200).json({
        status: 'success',
        data: {
            batch,
        },
    });
});

exports.updateBatch = catchAsync(async (req, res, next) => {
    const getbatch = await Batch.findById(req.params.id);
    const adminId = await getAdminID(req);

    // If this batch doesn't belong to the admin, return error
    if (getbatch.adminId.toString() !== adminId) return next(new AppError('Batch not found', 404));

    const filteredObj = filterObj(req.body, 'name', 'batchCode');
    const batch = await Batch.findByIdAndUpdate(req.params.id, filteredObj, {
        new: true,
    }).select('-adminId');

    res.status(200).json({
        status: 'success',
        data: {
            batch,
        },
    });
});

exports.deleteBatch = catchAsync(async (req, res, next) => {
    const getbatch = await Batch.findById(req.params.id);
    const adminId = await getAdminID(req);

    // If this batch doesn't belong to the admin, return error
    if (getbatch.adminId.toString() !== adminId) return next(new AppError('Batch not found', 404));

    await Batch.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: 'success',
        data: null,
    });
});
