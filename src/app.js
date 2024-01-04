import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { verifyJWT } from './middlewares/auth.middleware.js';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: '16kb'}));
app.use(express.urlencoded({extended: true, limit: '16kb'}));
app.use(express.static('public'));
app.use(cookieParser());

// import routes
import userRouter from './routes/user.route.js';
import taskRouter from './routes/tasks.route.js';

// use routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tasks', verifyJWT, taskRouter);

export default app;