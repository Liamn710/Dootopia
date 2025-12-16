const express = require('express');
const database = require('./connect');
const { ObjectId } = require('mongodb');

let listRoutes = express.Router();

// Get all lists
listRoutes.route("/lists").get(async (request, response) => {
    try {
        let db = database.getdb();
        let data = await db.collection("lists").find({}).toArray();
        if (data.length > 0) {
            response.status(200).json(data);
        } else {
            response.status(404).json({ error: "No lists found" });
        }
    } catch (error) {
        console.error('Error fetching lists:', error);
        response.status(500).json({ error: "Internal server error" });
    }
});

// Get list by ID
listRoutes.route("/lists/:id").get(async (request, response) => {
    try {
        let db = database.getdb();
        let data = await db.collection("lists").findOne({ _id: new ObjectId(request.params.id) });
        if (data) {
            response.status(200).json(data);
        } else {
            response.status(404).json({ error: "List not found" });
        }
    } catch (error) {
        console.error('Error fetching list:', error);
        response.status(500).json({ error: "Internal server error" });
    }
});

// Get lists by user ID
listRoutes.route("/lists/user/:userId").get(async (request, response) => {
    try {
        let db = database.getdb();
        let data = await db.collection("lists").find({ userId: request.params.userId }).toArray();
        if (data.length > 0) {
            response.status(200).json(data);
        } else {
            response.status(404).json({ error: "No lists found for this user" });
        }
    } catch (error) {
        console.error('Error fetching lists by user:', error);
        response.status(500).json({ error: "Internal server error" });
    }
});

// Create a new list
listRoutes.route("/lists").post(async (request, response) => {
    try {
        let db = database.getdb();
        let newList = {
            name: request.body.name,
            taskIds: request.body.taskIds || [],
            userId: request.body.userId,
            createdAt: request.body.createdAt || new Date()
        };
        
        let result = await db.collection("lists").insertOne(newList);
        const insertedList = await db.collection("lists").findOne({ _id: result.insertedId });
        response.status(201).json(insertedList);
    } catch (error) {
        console.error('Error creating list:', error);
        response.status(500).json({ error: "Internal server error", details: error.message });
    }
});

// Update list by ID
listRoutes.route("/lists/:id").put(async (request, response) => {
    try {
        let db = database.getdb();
        
        // Only update fields that are provided in the request
        let updateData = { $set: {} };
        
        if (request.body.name !== undefined) {
            updateData.$set.name = request.body.name;
        }
        if (request.body.taskIds !== undefined) {
            updateData.$set.taskIds = request.body.taskIds;
        }
        if (request.body.userId !== undefined) {
            updateData.$set.userId = request.body.userId;
        }
        
        let result = await db.collection("lists").updateOne(
            { _id: new ObjectId(request.params.id) },
            updateData
        );
        
        if (result.modifiedCount > 0) {
            const updatedList = await db.collection("lists").findOne({ _id: new ObjectId(request.params.id) });
            response.status(200).json(updatedList);
        } else {
            response.status(404).json({ error: "List not found or not updated" });
        }
    } catch (error) {
        console.error('Error updating list:', error);
        response.status(500).json({ error: "Internal server error" });
    }
});

// Add a task to a list
listRoutes.route("/lists/:id/tasks").post(async (request, response) => {
    try {
        let db = database.getdb();
        let taskId = request.body.taskId;
        
        let result = await db.collection("lists").updateOne(
            { _id: new ObjectId(request.params.id) },
            { $addToSet: { taskIds: taskId } } // $addToSet prevents duplicates
        );
        
        if (result.modifiedCount > 0) {
            const updatedList = await db.collection("lists").findOne({ _id: new ObjectId(request.params.id) });
            response.status(200).json(updatedList);
        } else {
            response.status(404).json({ error: "List not found or task already in list" });
        }
    } catch (error) {
        console.error('Error adding task to list:', error);
        response.status(500).json({ error: "Internal server error" });
    }
});

// Remove a task from a list
listRoutes.route("/lists/:id/tasks/:taskId").delete(async (request, response) => {
    try {
        let db = database.getdb();
        
        let result = await db.collection("lists").updateOne(
            { _id: new ObjectId(request.params.id) },
            { $pull: { taskIds: request.params.taskId } }
        );
        
        if (result.modifiedCount > 0) {
            const updatedList = await db.collection("lists").findOne({ _id: new ObjectId(request.params.id) });
            response.status(200).json(updatedList);
        } else {
            response.status(404).json({ error: "List not found or task not in list" });
        }
    } catch (error) {
        console.error('Error removing task from list:', error);
        response.status(500).json({ error: "Internal server error" });
    }
});

// Delete list by ID
listRoutes.route("/lists/:id").delete(async (request, response) => {
    try {
        let db = database.getdb();
        let result = await db.collection("lists").deleteOne({ _id: new ObjectId(request.params.id) });
        
        if (result.deletedCount > 0) {
            response.status(200).json({ message: "List deleted successfully" });
        } else {
            response.status(404).json({ error: "List not found" });
        }
    } catch (error) {
        console.error('Error deleting list:', error);
        response.status(500).json({ error: "Internal server error" });
    }
});

module.exports = listRoutes;