import mongoose from 'mongoose';
import {env} from './env.js';

const connectDB = async()=>{
    try {
        await mongoose.connect(env.MONGO_URI);
        console.log("MONGODB connected successfully");
    } catch (error) {
        console.error("MONGODB connection failed ---> ", err.message);
        console.error("Stack trace:", err.stack);
        process.exit(1);
    }
}
export default connectDB;