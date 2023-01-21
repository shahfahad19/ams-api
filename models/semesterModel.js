const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema(
    {
        batchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Batch',
            required: [true, 'A semester must have an batch id.'],
        },

        name: {
            type: String,
            required: [true, 'Semester name is missing'],
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

semesterSchema.virtual('adminId').get(function () {
    return this.batchId.adminId;
});

const Semester = mongoose.model('Semester', semesterSchema);

module.exports = Semester;
