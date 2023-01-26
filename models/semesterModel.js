const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Semester name is missing'],
        },
        batch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Batch',
            required: [true, 'A semester must have an batch id.'],
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

semesterSchema.index(
    {
        name: 1,
        batch: 1,
    },
    {
        unique: true,
    }
);

semesterSchema.virtual('admin').get(function () {
    return this.batch.admin;
});

const Semester = mongoose.model('Semester', semesterSchema);

module.exports = Semester;
