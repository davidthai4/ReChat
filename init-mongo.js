// MongoDB initialization script for ReChat
db = db.getSiblingDB('rechat');

// Create collections
db.createCollection('users');
db.createCollection('messages');
db.createCollection('channels');
db.createCollection('contacts');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });

db.messages.createIndex({ "senderId": 1, "recipientId": 1, "createdAt": -1 });
db.messages.createIndex({ "channelId": 1, "createdAt": -1 });

db.channels.createIndex({ "name": 1 }, { unique: true });
db.channels.createIndex({ "members": 1 });

// Create a default admin user (password: admin123)
db.users.insertOne({
  _id: ObjectId(),
  username: "admin",
  email: "admin@rechat.com",
  password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password: admin123
  firstName: "Admin",
  lastName: "User",
  profileColor: "#3B82F6",
  isAdmin: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

print("ReChat database initialized successfully!");
print("Default admin user created: admin@rechat.com / admin123");
