import axios from 'axios';

const BASE_URL = 'http://localhost:8888';

async function testSetup() {
    console.log('Testing setup...\n');

    try {
        console.log('1. Testing server connectivity...');
        const healthCheck = await axios.get(`${BASE_URL}/api/messages/test`);
        console.log('Server is running');

        console.log('\n2. Testing login endpoint...');
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'testuser1@example.com',
            password: 'testpassword123'
        }, {
            withCredentials: true
        });
        
        if (loginResponse.status === 200) {
            console.log('Login successful');
            console.log('User ID:', loginResponse.data.user._id);
        } else {
            console.log('Login failed');
        }

        console.log('\n3. Testing file upload endpoint...');
        
        const testContent = 'This is a test file for upload testing';
        const testFile = new Blob([testContent], { type: 'text/plain' });
        
        const formData = new FormData();
        formData.append('file', testFile, 'test.txt');
        
        const uploadResponse = await axios.post(`${BASE_URL}/api/messages/upload`, formData, {
            withCredentials: true,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        
        if (uploadResponse.status === 200) {
            console.log('File upload successful');
            console.log('File path:', uploadResponse.data.filePath);
        } else {
            console.log('File upload failed');
        }

        console.log('\nAll tests passed! You can now run the load tests.');

    } catch (error) {
        console.error('\nTest failed:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('Make sure your server is running on localhost:8888');
        } else if (error.response?.status === 404) {
            console.log('Check if the login endpoint is correct');
        } else if (error.response?.status === 401) {
            console.log('Test users might not exist. Run: node setup-test-users.js');
        }
    }
}

testSetup(); 