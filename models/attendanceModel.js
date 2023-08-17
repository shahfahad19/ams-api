const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: true,
        },
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject',
            required: true,
        },
        marked_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        attendances: [
            {
                student: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
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

// attendanceSchema.virtual('subjectId').get(function () {
//     return this.subject._id;
// });
// attendanceSchema.virtual('subjectName').get(function () {
//     return this.subject.name;
// });
// attendanceSchema.virtual('semesterId').get(function () {
//     return this.subject.semester._id;
// });
// attendanceSchema.virtual('semesterName').get(function () {
//     return this.subject.semester.name;
// });
// attendanceSchema.virtual('teacherId').get(function () {
//     return this.subject.teacher._id;
// });
// attendanceSchema.virtual('teacherName').get(function () {
//     return this.subject.teacher.name;
// });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
