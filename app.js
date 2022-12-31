const express = require('express');

const adminRouter = require('./routes/adminRoutes');
const attendanceRouter = require('./routes/attendanceRoutes');
const batchRouter = require('./routes/batchRoutes');
const semesterRouter = require('./routes/semesterRoutes');
const studentRouter = require('./routes/studentRoutes');
const subjectRouter = require('./routes/subjectRoutes');
const teacherRouter = require('./routes/teacherRoutes');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.end('Hi');
});

app.use('/admins', adminRouter);
app.use('/attendances', attendanceRouter);
app.use('/batches', batchRouter);
app.use('/semesters', semesterRouter);
app.use('/students', studentRouter);
app.use('/subjects', subjectRouter);
app.use('/teachers', teacherRouter);

module.exports = app;
