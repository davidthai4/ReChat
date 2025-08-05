#!/bin/bash

echo "Testing endpoints..."

# Test 1: Check if server is running
echo "1. Testing server connectivity..."
if curl -s http://localhost:8888/api/messages/test > /dev/null; then
    echo "Server is running"
else
    echo "Server is not running on localhost:8888"
    exit 1
fi

# Test 2: Test login endpoint
echo -e "\n2. Testing login endpoint..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8888/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"testuser1@example.com","password":"testpassword123"}' \
    -c cookies.txt)

if echo "$LOGIN_RESPONSE" | grep -q "user"; then
    echo "Login successful"
    USER_ID=$(echo "$LOGIN_RESPONSE" | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)
    echo "User ID: $USER_ID"
else
    echo "Login failed"
    echo "Response: $LOGIN_RESPONSE"
fi

# Test 3: Test file upload endpoint
echo -e "\n3. Testing file upload endpoint..."
echo "Creating test file..."
echo "This is a test file for upload testing" > test-upload.txt

UPLOAD_RESPONSE=$(curl -s -X POST http://localhost:8888/api/messages/upload \
    -H "Content-Type: multipart/form-data" \
    -F "file=@test-upload.txt" \
    -b cookies.txt)

if echo "$UPLOAD_RESPONSE" | grep -q "filePath"; then
    echo "File upload successful"
    FILE_PATH=$(echo "$UPLOAD_RESPONSE" | grep -o '"filePath":"[^"]*"' | cut -d'"' -f4)
    echo "File path: $FILE_PATH"
else
    echo "File upload failed"
    echo "Response: $UPLOAD_RESPONSE"
fi

# Cleanup
rm -f test-upload.txt cookies.txt

echo -e "\nEndpoint testing complete!" 