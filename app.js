const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = express();

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const adminRouter = require('./routes/adminRoutes');
const studentRouter = require('./routes/studentRoutes');
const teacherRouter = require('./routes/teacherRoutes');

dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err);
    process.exit(1);
});

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.set('strictQuery', false);
mongoose.connect(DB).then(() => console.log('DB connection successful!'));

app.use(express.json());
app.get('/', (req, res) => {
    res.end('AMS API is running');
});

app.use('/admin', adminRouter);
app.use('/student', studentRouter);
app.use('/teacher', teacherRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.stack);
    server.close(() => {
        process.exit(1);
    });
});
