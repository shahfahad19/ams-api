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
        unique: true,
    },
});

const Batch = mongoose.model('Batch', batchSchema);

module.exports = Batch;
