# File Upload Load Testing with Artillery

How to test your file upload functionality using Artillery.

## Prerequisites

1. **Install Artillery**: Make sure you have Artillery installed globally
   ```bash
   npm install -g artillery
   ```

2. **Install Artillery Socket.IO plugin**:
   ```bash
   npm install -g artillery-plugin-socketio
   ```

## Setup

### 1. Create Test Users

First, create the test users in your database:

```bash
node setup-test-users.js
```

This will create two test users:
- `testuser1@example.com` / `testpassword123`
- `testuser2@example.com` / `testpassword123`

### 2. Start Your Server

Make sure your server is running on `localhost:8888`:

```bash
cd server
npm run dev
```

### 3. Generate Test Files

The test files will be automatically generated when you run the tests, but you can also generate them manually:

```bash
node artillery-processor.js
```

This creates:
- `test-files/small-file.txt` (1KB)
- `test-files/medium-file.pdf` (100KB)
- `test-files/large-file.zip` (1MB)

## Running the Load Tests

### Basic Socket.IO Test

Test socket-based file message sending:

```bash
artillery run socketio-test.yml
```

### File Upload Performance Test

Test HTTP file uploads with authentication:

```bash
artillery run socketio-test.yml --output results.json
```

### Generate HTML Report

```bash
artillery run socketio-test.yml --output results.json
artillery report results.json
```

## Test Scenarios

The test configuration includes several scenarios:

### 1. Socket.IO File Message Test
- Tests sending file messages via WebSocket
- Simulates file sharing in chat
- Tests both direct messages and channel messages

### 2. Authenticated File Upload Test
- Tests HTTP file uploads with authentication
- Uploads files of different sizes (1KB, 100KB, 1MB)
- Tests the `/api/messages/upload` endpoint

### 3. Concurrent File Upload Stress Test
- Generates random test files
- Tests concurrent uploads
- Stress tests the file upload system

### 4. File Upload Performance Test
- Tests different file types and sizes
- Measures upload performance
- Tests authentication flow

## Configuration Options

### Adjusting Load

Modify the `phases` section in `socketio-test.yml`:

```yaml
phases:
  - duration: 60        # Test duration in seconds
    arrivalRate: 2      # New users per second
```

### Testing Different File Sizes

Modify the `artillery-processor.js` file to generate different file sizes:

```javascript
// Small file (1KB)
const smallContent = 'A'.repeat(1024);

// Medium file (100KB)
const mediumContent = 'B'.repeat(1024 * 100);

// Large file (1MB)
const largeContent = 'C'.repeat(1024 * 1024);
```

## Monitoring Results

### Key Metrics to Watch

1. **Response Times**: How long file uploads take
2. **Throughput**: Files uploaded per second
3. **Error Rates**: Failed uploads
4. **Memory Usage**: Server memory consumption
5. **Disk I/O**: File system performance

### Expected Results

- **Small files (1KB)**: Should upload in < 100ms
- **Medium files (100KB)**: Should upload in < 500ms
- **Large files (1MB)**: Should upload in < 2s

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Make sure test users exist in the database
   - Check that the login endpoint is working

2. **File Upload Errors**
   - Verify the upload directory exists and is writable
   - Check file permissions on the server

3. **Socket.IO Connection Issues**
   - Ensure the server is running on the correct port
   - Check CORS configuration

### Debug Mode

Run tests with verbose output:

```bash
artillery run socketio-test.yml --verbose
```

## Customization

### Adding New Test Scenarios

1. Add new scenarios to `socketio-test.yml`
2. Create corresponding test files if needed
3. Update the processor functions in `artillery-processor.js`

### Testing Different File Types

Add new file types to the processor:

```javascript
// Add to generateTestFiles function
const imageContent = Buffer.alloc(1024 * 50); // 50KB image
fs.writeFileSync(path.join(testFilesDir, 'test-image.jpg'), imageContent);
```

## Performance Optimization Tips

1. **Server-side optimizations**:
   - Use streaming for large file uploads
   - Implement file size limits
   - Add rate limiting
   - Use CDN for file storage

2. **Client-side optimizations**:
   - Implement chunked uploads
   - Add progress indicators
   - Compress files before upload

3. **Database optimizations**:
   - Index file metadata
   - Implement file cleanup
   - Monitor storage usage

## Cleanup

After testing, clean up test files:

```bash
rm -rf test-files/
```

The test files are automatically cleaned up by the processor, but you can manually remove them if needed. 