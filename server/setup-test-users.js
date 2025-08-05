import mongoose from 'mongoose';
import User from './models/UserModel.js';
import dotenv from 'dotenv';

dotenv.config();

const createTestUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('Connected to MongoDB');

        // Check if test users already exist
        const existingUser1 = await User.findOne({ email: 'testuser1@example.com' });
        const existingUser2 = await User.findOne({ email: 'testuser2@example.com' });

        if (!existingUser1) {
            const testUser1 = new User({
                email: 'testuser1@example.com',
                password: 'testpassword123',
                firstName: 'Test',
                lastName: 'User1',
                profileSetup: true,
                color: 0
            });
            await testUser1.save();
            console.log('Created test user 1');
        } else {
            console.log('Test user 1 already exists');
        }

        if (!existingUser2) {
            const testUser2 = new User({
                email: 'testuser2@example.com',
                password: 'testpassword123',
                firstName: 'Test',
                lastName: 'User2',
                profileSetup: true,
                color: 1
            });
            await testUser2.save();
            console.log('Created test user 2');
        } else {
            console.log('Test user 2 already exists');
        }

        console.log('Test users setup complete!');
        console.log('You can now run the Artillery load test.');
        
    } catch (error) {
        console.error('Error setting up test users:', error);
        console.log('Make sure your server is running and MongoDB is connected');
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

createTestUsers(); 