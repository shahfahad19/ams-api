const Batch = require('./../models/batchModel');
const APIFeatures = require('./../utils/apiFeatures');

exports.getAllBatches = async (req, res) => {
    try {
        const features = new APIFeatures(Batch.find(), req.query).filter().sort().limit().paginate();
        const batches = await features.query.populate('adminId');

        let batchArray = [];

        batches.forEach((batch, i) => {
            batchArray[i] = {
                _id: batch._id,
                name: batch.name,
                department: batch.adminId.department,
            };
        });

        // SEND RESPONSE
        res.status(200).json({
            status: 'success',
            results: batches.length,
            data: {
                batches: batchArray,
            },
        });
    } catch (err) {
        console.log(err);
        res.status(404).json({
            status: 'fail',
            message: err,
        });
    }
};

exports.getBatch = async (req, res) => {
    try {
        const student = await Batch.findById(req.params.id);

        res.status(200).json({
            status: 'success',
            data: {
                student,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err,
        });
    }
};

exports.createBatch = async (req, res) => {
    try {
        const newBatch = await Batch.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                Batch: newBatch,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err,
        });
    }
};

exports.updateBatch = async (req, res) => {
    try {
        const student = await Batch.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });

        res.status(200).json({
            status: 'success',
            data: {
                student,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err,
        });
    }
};

exports.deleteBatch = async (req, res) => {
    try {
        await Batch.findByIdAndDelete(req.params.id);

        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err,
        });
    }
};
