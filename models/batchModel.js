const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Batch name is missing'],
        },
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'A batch must have an admin id.'],
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
    },
    {
        toJSON: { virtuals: true },
    }
);

batchSchema.index(
    {
        name: 1,
        admin: 1,
    },
    {
        unique: true,
    }
);

const Batch = mongoose.model('Batch', batchSchema);

module.exports = Batch;
