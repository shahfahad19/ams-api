const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const globalErrorHandler = require('./controllers/errorController');
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const batchRouter = require('./routes/batchRoutes');
const semesterRouter = require('./routes/semesterRoutes');
const subjectRouter = require('./routes/subjectRoutes');
const attendanceRouter = require('./routes/attendanceRoutes');
const path = require('path');

app.use(cors());
app.use(express.json());
app.use(cookieParser());
// app.use(bodyParser.text({ type: '/' }));

app.get('/api', (req, res) => {
    res.end('AMS API is running');
});

app.use('/api/user', authRouter);
app.use('/api/users', userRouter);
app.use('/api/batches', batchRouter);
app.use('/api/semesters', semesterRouter);
app.use('/api/subjects', subjectRouter);
app.use('/api/attendances', attendanceRouter);

// Serve static files from the "build" directory
app.use(express.static(path.join(__dirname, 'frontend')));

// For any other route, send the index.html file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.use(globalErrorHandler);

module.exports = app;
