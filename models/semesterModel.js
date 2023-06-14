const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema(
    {
        name: {
            type: Number,
            min: 1,
            max: 8,
            required: [true, 'Semester name is missing'],
        },
        batch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Batch',
            required: [true, 'A semester must have a batch id.'],
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

// Method to archive semester and subjects
semesterSchema.methods.archiveSemester = async function () {
    const semesterId = this._id;

    try {
        // Archive the semester
        this.archived = true;
        await this.save();

        // Archive related subjects
        await mongoose.model('Subject').updateMany({ semesterId }, { archived: true });

        console.log('Semester archived successfully.');
    } catch (err) {
        console.error('Error archiving semester:', err);
    }
};

const Semester = mongoose.model('Semester', semesterSchema);

module.exports = Semester;
