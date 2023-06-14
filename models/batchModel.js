const mongoose = require('mongoose');
const Semester = require('./semesterModel');
const Subject = require('./subjectModel');
const User = require('./userModel');

const batchSchema = new mongoose.Schema(
    {
        name: {
            type: Number,
            min: 1,
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

// Method to archive batch, semesters, and subjects
batchSchema.methods.archiveBatch = async function () {
    const batch = this._id;

    try {
        // Archive the batch
        this.archived = true;
        await this.save();

        // Archive related semesters
        await Semester.updateMany({ batch }, { archived: true });

        // Archive related subjects
        await Subject.updateMany({ semester: { $in: await getSemesterIds(batch) } }, { archived: true });

        console.log('Batch archived successfully.');
    } catch (err) {
        console.error('Error archiving batch:', err);
    }
};

// Function to get semester IDs for a given batch
async function getSemesterIds(batch) {
    const semesters = await Semester.find({ batch }, '_id');
    return semesters.map((semester) => semester._id);
}

const Batch = mongoose.model('Batch', batchSchema);

module.exports = Batch;
