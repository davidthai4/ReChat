import { Router } from "express";
import { verifyToken } from "../middleware/AuthMiddleware.js";
import { getContactsForDMList, searchContacts } from "../controllers/ContactsController.js";
import User from "../models/UserModel.js"; // Added import for User model


const contactsRoutes = Router();

// // Temporary test route to see all users
// contactsRoutes.get("/test-users", verifyToken, async (req, res) => {
//     try {
//         const allUsers = await User.find({});
//         res.json({ 
//             totalUsers: allUsers.length,
//             users: allUsers.map(u => ({
//                 _id: u._id,
//                 email: u.email,
//                 firstName: u.firstName,
//                 lastName: u.lastName,
//                 profileSetup: u.profileSetup
//             }))
//         });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

contactsRoutes.post("/search", verifyToken, searchContacts);
contactsRoutes.get("/get-contacts-for-dm", verifyToken, getContactsForDMList);

export default contactsRoutes;