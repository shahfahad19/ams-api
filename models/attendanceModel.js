const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: true,
        },
        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject',
            required: true,
            select: false,
        },
        attendances: [
            {
                studentId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Student',
                    required: true,
                },
                status: {
                    type: String,
                    required: true,
                },
            },
        ],
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

attendanceSchema.virtual('subject_Id').get(function () {
    return this.subjectId._id;
});
attendanceSchema.virtual('subjectName').get(function () {
    return this.subjectId.name;
});
attendanceSchema.virtual('semesterId').get(function () {
    return this.subjectId.semesterId._id;
});
attendanceSchema.virtual('semesterName').get(function () {
    return this.subjectId.semesterId.name;
});
attendanceSchema.virtual('teacherId').get(function () {
    return this.subjectId.teacherId._id;
});
attendanceSchema.virtual('teacherName').get(function () {
    return this.subjectId.teacherId.name;
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
