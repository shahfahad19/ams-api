const Attendance = require('./../models/attendanceModel');
const mongoose = require('mongoose');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

// Get Attendance of a date
exports.getAttendance = catchAsync(async (req, res) => {
    const attendance = await Attendance.findById(req.params.id)
        .populate({
            path: 'subject',
            populate: {
                path: 'teacher',
            },
        })
        .populate({
            path: 'subject',
            populate: {
                path: 'semester',
            },
        })
        .populate({
            path: 'attendances',
            populate: {
                path: 'student',
            },
        });
    let sepAtt = [];
    attendance.attendances.forEach((sepatt, index) => {
        sepAtt[index] = {
            student: sepatt.student._id,
            rollNo: sepatt.student.rollNo,
            name: sepatt.student.name,
            status: sepatt.status,
        };
    });
    const refactoredAttendanceArray = {
        _id: attendance._id,
        date: attendance.date,
        subject: attendance.subject._id,
        subjectName: attendance.subject.name,
        teacher: attendance.subject.teacher._id,
        teacherName: attendance.subject.teacher.name,
        semester: attendance.subject.semester._id,
        semester: attendance.subject.semester.name,
        attendance: sepAtt,
    };
    res.status(200).json({
        status: 'success',
        data: {
            attendance: attendance,
        },
    });
});

// Delete attendance

exports.deleteAttendance = catchAsync(async (req, res) => {
    await Attendance.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

// Get Attendance of a subject

exports.getSubjectAttendance = catchAsync(async (req, res) => {
    //const features = new APIFeatures(Attendance.find(), req.query).filter().sort().limit().paginate();
    const subject = mongoose.Types.ObjectId('63ac1c21f1000278723b489a');
    const attendances = await Attendance.aggregate([
        {
            $lookup: {
                from: 'subjects',
                localField: 'subject',
                foreignField: '_id',
                as: 'subject',
            },
        },
        {
            $unwind: '$subject',
        },
        {
            $match: {
                'subject._id': subject,
            },
        },
        {
            $project: {
                _id: '$_id',
                date: '$date',
                subject: '$subject',
                students: '$students',
                attendances: '$attendances',
            },
        },
        {
            $sort: {
                date: 1,
            },
        },
    ]);
    res.status(200).json({
        status: 'success',
        results: attendances.length,
        data: {
            attendances,
        },
    });
});

// exports.getSubjectAttendance = catchAsync(async (req, res) => {
//     //const features = new APIFeatures(Attendance.find(), req.query).filter().sort().limit().paginate();
//     const subject = mongoose.Types.ObjectId(req.params.subject);
//     const attendances = await Attendance.aggregate([
//         {
//             $match: {
//                 subject: subject,
//             },
//         },
//         {
//             $sort: {
//                 date: 1,
//             },
//         },
//         {
//             $unwind: '$attendances',
//         },
//         {
//             $lookup: {
//                 from: 'students',
//                 localField: 'attendances.student',
//                 foreignField: '_id',
//                 as: 'student',
//             },
//         },
//         {
//             $group: {
//                 _id: '$student._id',
//                 name: { $first: '$student.name' },
//                 rollNo: { $first: '$student.rollNo' },
//                 dates: { $push: '$date' },
//                 attendance: { $push: '$attendances' },
//             },
//         },
//         {
//             $unwind: '$_id',
//         },
//         {
//             $unwind: '$name',
//         },
//         {
//             $unwind: '$rollNo',
//         },
//         {
//             $sort: {
//                 rollNo: 1,
//             },
//         },
//         {
//             $unset: 'attendance.student',
//         },
//         {
//             $unset: 'attendance._id',
//         },
//         {
//             $project: {
//                 rollNo: '$rollNo',
//                 name: '$name',
//                 dates: '$dates',
//                 percentage: {
//                     $concat: [
//                         {
//                             $convert: {
//                                 input: {
//                                     $multiply: [
//                                         {
//                                             $divide: [
//                                                 {
//                                                     $size: {
//                                                         $filter: {
//                                                             input: '$attendance',
//                                                             cond: {
//                                                                 $eq: ['$$this.status', 'present'],
//                                                             },
//                                                         },
//                                                     },
//                                                 },
//                                                 {
//                                                     $size: '$attendance',
//                                                 },
//                                             ],
//                                         },
//                                         100,
//                                     ],
//                                 },
//                                 to: 'string',
//                             },
//                         },
//                         '%',
//                     ],
//                 },
//                 attendance: '$attendance',
//             },
//         },
//     ]);

//     // let refactoredAttendanceArray = [];
//     // attendances.forEach((attendance, index) => {
//     //     let sepAtt = [];
//     //     attendance.attendances.forEach((sepatt, index) => {
//     //         sepAtt[index] = {
//     //             student: sepatt.student._id,
//     //             rollNo: sepatt.student.rollNo,
//     //             name: sepatt.student.name,
//     //             status: sepatt.status,
//     //         };
//     //     });
//     //     refactoredAttendanceArray[index] = {
//     //         _id: attendance._id,
//     //         date: attendance.date,
//     //         subject: attendance.subject,
//     //         attendance: sepAtt,
//     //     };
//     // });
//     // SEND RESPONSE
//     res.status(200).json({
//         status: 'success',
//         results: attendances.length,
//         data: {
//             attendances,
//         },
//     });
// });

// Get Student Attendance

exports.getStudentAttendance = catchAsync(async (req, res) => {
    const student = mongoose.Types.ObjectId(req.params.studentid) || mongoose.Types.ObjectId(req.student._id);

    const stdatt = await Attendance.aggregate([
        {
            $match: {
                'attendances.student': student,
            },
        },
        {
            $unwind: '$attendances',
        },
        {
            $match: {
                'attendances.student': student,
            },
        },
        {
            $group: {
                _id: '$subject',
                attendances: {
                    $push: '$attendances',
                },
            },
        },
        {
            $lookup: {
                from: 'subjects',
                localField: '_id',
                foreignField: '_id',
                as: 'subject',
            },
        },
        {
            $lookup: {
                from: 'teachers',
                localField: 'subject.teacher',
                foreignField: '_id',
                as: 'teacher',
            },
        },

        {
            $lookup: {
                from: 'semesters',
                localField: 'subject.semester',
                foreignField: '_id',
                as: 'semester',
            },
        },
        {
            $unwind: '$subject',
        },
        {
            $unwind: '$teacher',
        },
        {
            $unwind: '$semester',
        },
        {
            $lookup: {
                from: 'students',
                localField: 'attendances.student',
                foreignField: '_id',
                as: 'studentData',
            },
        },
        {
            $unwind: '$studentData',
        },
        // {
        //     $match: {
        //         'semester._id': semester,
        //     },
        // },
        {
            $project: {
                student: '$studentData._id',
                studentName: '$studentData.name',
                studentRollNo: '$studentData.rollNo',
                subject: '$_id',
                subjectName: '$subject.name',
                teacher: '$teacher._id',
                teacherName: '$teacher.name',
                semester: '$semester._id',
                semesterName: '$semester.name',
                totalClass: {
                    $size: '$attendances',
                },
                present: {
                    $size: {
                        $filter: {
                            input: '$attendances',
                            cond: {
                                $eq: ['$$this.status', 'present'],
                            },
                        },
                    },
                },
                absent: {
                    $size: {
                        $filter: {
                            input: '$attendances',
                            cond: {
                                $eq: ['$$this.status', 'absent'],
                            },
                        },
                    },
                },
                leave: {
                    $size: {
                        $filter: {
                            input: '$attendances',
                            cond: {
                                $eq: ['$$this.status', 'leave'],
                            },
                        },
                    },
                },
                percentage: {
                    $concat: [
                        {
                            $convert: {
                                input: {
                                    $multiply: [
                                        {
                                            $divide: [
                                                {
                                                    $size: {
                                                        $filter: {
                                                            input: '$attendances',
                                                            cond: {
                                                                $eq: ['$$this.status', 'present'],
                                                            },
                                                        },
                                                    },
                                                },
                                                {
                                                    $size: '$attendances',
                                                },
                                            ],
                                        },
                                        100,
                                    ],
                                },
                                to: 'string',
                            },
                        },
                        '%',
                    ],
                },
                attendances: '$attendances',
            },
        },
        {
            $unset: '_id',
        },
        {
            $unset: 'attendances.student',
        },
        {
            $unset: 'attendances._id',
        },
    ]);
    res.send({
        status: 'success',
        results: stdatt.length,
        attendances: stdatt,
    });
});

// create attendance
exports.createAttendance = catchAsync(async (req, res) => {
    const newAttendance = await Attendance.create(req.body)
        .populate({
            path: 'subject',
            populate: {
                path: 'teacher',
            },
        })
        .populate({
            path: 'subject',
            populate: {
                path: 'semester',
            },
        });
    res.status(201).json({
        status: 'success',
        data: {
            Attendance: newAttendance,
        },
    });
});
