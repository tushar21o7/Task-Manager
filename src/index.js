import dotenv from 'dotenv';
import connectDB from './db/index.js';
import app from './app.js';

dotenv.config({
    path: './.env'
})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => console.log(`app listening on port ${process.env.PORT}`));
    app.on('error', (error) => {
        console.log('ERROR: ', error);
        throw error;
    })
})
.catch((error) => console.log('DB connection failed: ', error));