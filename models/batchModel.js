const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: [true, 'A batch must have an admin id.'],
    },

    name: {
        type: String,
        required: [true, 'Batch name is missing'],
    },
    batchCode: {
        type: String,
        required: [true, 'Batch code is missing'],
        unique: true,
    },
    archived: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        select: false,
    },
});

const Batch = mongoose.model('Batch', batchSchema);

module.exports = Batch;
