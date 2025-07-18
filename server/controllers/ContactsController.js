import User from "../models/UserModel.js";

export const searchContacts = async (request, response, next) => {
    try {
        console.log("=== SEARCH CONTACTS START ===");
        console.log("Request body:", request.body);
        console.log("Request userID:", request.userID);

        const {searchTerm} = request.body;

        if (searchTerm === undefined || searchTerm === null || searchTerm === "") {
            console.log("Search term is empty");
            return response.status(400).send("Search term is required.");
        }

        if (!request.userID) {
            console.log("No userID found in request");
            return response.status(401).send("User not authenticated");
        }

        console.log("Searching for term:", searchTerm);

        // Test database connection
        const totalUsers = await User.countDocuments();
        console.log("Total users in database:", totalUsers);

        const sanitizedSearchTerm = searchTerm.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );
        const regex = new RegExp(sanitizedSearchTerm, "i");

        console.log("Searching with regex:", regex);

        const contacts = await User.find({
            $and: [
                { id: { $ne: request.userID } },
                {
                    $or: [
                        { firstName: regex },
                        { lastName: regex },
                        { email: regex }
                    ],
                },
            ],
        });
        
        console.log("Found contacts count:", contacts.length);
        console.log("=== SEARCH CONTACTS END ===");
        
        return response.status(200).json({ contacts });
        
    } catch (error) {
        console.log("=== SEARCH CONTACTS ERROR ===");
        console.log("Error message:", error.message);
        console.log("Error stack:", error.stack);
        console.log("=== END ERROR ===");
        response.status(500).send("Internal server error");
    }
};