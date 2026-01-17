const express = require('express');
const database = require('./connect');
const { ObjectId } = require('mongodb');

let rewardRoutes = express.Router();

rewardRoutes.route("/rewards").get(async (request, response) => {
    let db = database.getdb();
    const { userId } = request.query;
    
    // Build filter object - if userId is provided, filter by owner
    const filter = userId ? { owner: userId } : {};
    
    let data = await db.collection("rewards").find(filter).toArray();
    if (data.length > 0) {
        response.status(200).json(data);
    } else {
        response.status(404).json({ error: "No rewards found" });
    }
});

rewardRoutes.route("/rewards/:id").get(async (request, response) => {
    try {
        let db = database.getdb();
        let data = await db.collection("rewards").findOne({ _id: new ObjectId(request.params.id) });
        if (data) {
            response.status(200).json(data);
        } else {
            response.status(404).json({ error: "Reward not found" });
        }
    } catch (error) {
        console.error('Error fetching reward:', error);
        response.status(500).json({ error: "Failed to fetch reward", details: error.message });
    }
});

rewardRoutes.route("/rewards").post(async (request, response) => {
    let db = database.getdb();
    let newReward = {
        title: request.body.title,
        points: request.body.points,
        description: request.body.description,
        userId: request.body.userId,
        imageUrl: request.body.imageUrl,
        completed: false,
        owner: request.body.userId,
        sharedWith: request.body.sharedWith || [] // Array of user IDs reward is shared with
    };
    let result = await db.collection("rewards").insertOne(newReward);
    response.status(201).json({ ...newReward, _id: result.insertedId });
});

rewardRoutes.route("/rewards/:id").put(async (request, response) => {
    try {
        let db = database.getdb();
        let updatedReward = {};
        
        // Only include fields that are present in the request
        if (request.body.title !== undefined) updatedReward.title = request.body.title;
        if (request.body.points !== undefined) updatedReward.points = request.body.points;
        if (request.body.description !== undefined) updatedReward.description = request.body.description;
        if (request.body.completed !== undefined) updatedReward.completed = request.body.completed;
        if (request.body.imageUrl !== undefined) updatedReward.imageUrl = request.body.imageUrl;
        if (request.body.sharedWith !== undefined) updatedReward.sharedWith = request.body.sharedWith;
        
        let result = await db.collection("rewards").updateOne(
            { _id: new ObjectId(request.params.id) },
            { $set: updatedReward }
        );
        
        if (result.modifiedCount > 0 || result.matchedCount > 0) {
            response.status(200).json({ message: "Reward updated successfully" });
        } else {
            response.status(404).json({ error: "Reward not found" });
        }
    } catch (error) {
        console.error('Error updating reward:', error);
        response.status(500).json({ error: "Failed to update reward", details: error.message });
    }
});

rewardRoutes.route("/rewards/:id").delete(async (request, response) => {
    try {
        let db = database.getdb();
        let result = await db.collection("rewards").deleteOne({ _id: new ObjectId(request.params.id) });
        if (result.deletedCount > 0) {
            response.status(200).json({ message: "Reward deleted successfully" });
        } else {
            response.status(404).json({ error: "Reward not found" });
        }
    } catch (error) {
        console.error('Error deleting reward:', error);
        response.status(500).json({ error: "Failed to delete reward", details: error.message });
    }
});

// Get rewards shared with a specific user
rewardRoutes.route("/rewards/shared/:userId").get(async (request, response) => {
    try {
        let db = database.getdb();
        const userId = request.params.userId;
        
        // Find all rewards where the user is in the sharedWith array
        let data = await db.collection("rewards")
            .find({ 
                sharedWith: userId,
                completed: false // Only show unclaimed rewards
            })
            .toArray();
        
        response.status(200).json(data);
    } catch (error) {
        console.error('Error fetching shared rewards:', error);
        response.status(500).json({ error: "Failed to fetch shared rewards", details: error.message });
    }
});

// Share a reward with specific users
rewardRoutes.route("/rewards/:id/share").post(async (request, response) => {
    try {
        let db = database.getdb();
        const { userIds } = request.body; // Array of user IDs to share with
        
        if (!Array.isArray(userIds) || userIds.length === 0) {
            return response.status(400).json({ error: "userIds must be a non-empty array" });
        }
        
        let result = await db.collection("rewards").updateOne(
            { _id: new ObjectId(request.params.id) },
            { $addToSet: { sharedWith: { $each: userIds } } } // Add users to sharedWith array without duplicates
        );
        
        if (result.modifiedCount > 0 || result.matchedCount > 0) {
            response.status(200).json({ message: "Reward shared successfully" });
        } else {
            response.status(404).json({ error: "Reward not found" });
        }
    } catch (error) {
        console.error('Error sharing reward:', error);
        response.status(500).json({ error: "Failed to share reward", details: error.message });
    }
});

// Remove users from shared reward
rewardRoutes.route("/rewards/:id/unshare").post(async (request, response) => {
    try {
        let db = database.getdb();
        const { userIds } = request.body; // Array of user IDs to remove
        
        if (!Array.isArray(userIds) || userIds.length === 0) {
            return response.status(400).json({ error: "userIds must be a non-empty array" });
        }
        
        let result = await db.collection("rewards").updateOne(
            { _id: new ObjectId(request.params.id) },
            { $pull: { sharedWith: { $in: userIds } } } // Remove users from sharedWith array
        );
        
        if (result.modifiedCount > 0 || result.matchedCount > 0) {
            response.status(200).json({ message: "Users removed from shared reward" });
        } else {
            response.status(404).json({ error: "Reward not found" });
        }
    } catch (error) {
        console.error('Error unsharing reward:', error);
        response.status(500).json({ error: "Failed to unshare reward", details: error.message });
    }
});

module.exports = rewardRoutes;
