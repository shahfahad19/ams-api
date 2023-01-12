const catchAsync = require('../utils/catchAsync');
const Batch = require('./../models/batchModel');
const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('../utils/appError');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

exports.getAllBatches = catchAsync(async (req, res) => {
    let adminId = req.admin._id;
    const features = new APIFeatures(Batch.find(), req.query)
        .filter()
        .sort()
        .limit('id', 'name', 'batchCode')
        .paginate();
    const batches = await features.query.populate('adminId');

    let batchArray = [];

    // if (batch.adminId._id === adminId)
    batches.forEach((batch, i) => {
        if (batch.adminId._id.equals(adminId))
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
    const adminId = req.admin._id;
    const batch = {
        adminId,
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
    res.status(200).json({
        status: 'success',
        data: {
            batch,
        },
    });
});

exports.updateBatch = catchAsync(async (req, res, next) => {
    const filteredObj = filterObj(req.body, 'name', 'batchCode', 'archived');
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
    await Batch.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: 'success',
        data: null,
    });
});
