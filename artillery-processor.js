const fs = require('fs');
const path = require('path');

// Create test files directory if it doesn't exist
const testFilesDir = './test-files';
if (!fs.existsSync(testFilesDir)) {
    fs.mkdirSync(testFilesDir, { recursive: true });
}

// Generate test files of different sizes
function generateTestFiles() {
    // Small file (1KB)
    const smallContent = 'A'.repeat(1024);
    fs.writeFileSync(path.join(testFilesDir, 'small-file.txt'), smallContent);
    
    // Medium file (100KB)
    const mediumContent = 'B'.repeat(1024 * 100);
    fs.writeFileSync(path.join(testFilesDir, 'medium-file.pdf'), mediumContent);
    
    // Large file (1MB)
    const largeContent = 'C'.repeat(1024 * 1024);
    fs.writeFileSync(path.join(testFilesDir, 'large-file.zip'), largeContent);
}

// Generate test files on startup
generateTestFiles();

// Custom function to generate a test file with random content
function generateTestFile(requestParams, context, ee, next) {
    try {
        const timestamp = Date.now();
        const randomSize = Math.floor(Math.random() * 1024 * 100) + 1024; // 1KB to 100KB
        const content = `Test file content ${timestamp} - ${'X'.repeat(randomSize)}`;
        const fileName = `test-file-${timestamp}.txt`;
        const filePath = path.join(testFilesDir, fileName);
        
        fs.writeFileSync(filePath, content);
        
        // Store the file path in context for the next step
        if (context && context.vars) {
            context.vars.testFilePath = filePath;
        }
        
        return next();
    } catch (error) {
        console.error('Error generating test file:', error);
        return next();
    }
}

// Function to clean up test files after test
function cleanupTestFiles(requestParams, context, ee, next) {
    try {
        const testFilesDir = './test-files';
        if (fs.existsSync(testFilesDir)) {
            fs.readdirSync(testFilesDir).forEach(file => {
                const filePath = path.join(testFilesDir, file);
                if (fs.statSync(filePath).isFile()) {
                    fs.unlinkSync(filePath);
                }
            });
        }
        return next();
    } catch (error) {
        console.error('Error cleaning up test files:', error);
        return next();
    }
}

// Export the functions
module.exports = {
    generateTestFile,
    cleanupTestFiles
}; 