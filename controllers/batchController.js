const catchAsync = require('../utils/catchAsync');
const crypto = require('crypto');
const Batch = require('./../models/batchModel');
const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

exports.getAllBatches = catchAsync(async (req, res) => {
    let admin = req.user._id;

    let paramsDept = req.query.dept;
    if (paramsDept !== undefined) {
        admin = paramsDept;
    }
    admin = mongoose.Types.ObjectId(admin);
    const batches = await Batch.aggregate([
        {
            $match: {
                admin: admin,
            },
        },
    ]);

    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        results: batches.length,
        data: {
            batches: batches,
        },
    });
});

exports.createBatch = catchAsync(async (req, res, next) => {
    const admin = req.user._id;
    const batch = {
        admin,
        name: req.body.name,
        batchCode: crypto.randomBytes(2).toString('hex').toUpperCase(),
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
    const filteredObj = filterObj(req.body, 'name', 'archived');
    const batch = await Batch.findByIdAndUpdate(req.params.id, filteredObj, {
        new: true,
    }).select('-admin');

    res.status(200).json({
        status: 'success',
        data: {
            batch,
        },
    });
});

exports.updateBatchCode = catchAsync(async (req, res, next) => {
    const batch = await Batch.findByIdAndUpdate(
        req.params.id,
        { batchCode: crypto.randomBytes(2).toString('hex').toUpperCase() },
        {
            new: true,
        }
    ).select('batchCode');

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
