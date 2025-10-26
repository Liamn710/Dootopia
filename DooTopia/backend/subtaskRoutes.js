const express = require('express');
const database = require('./connect');
const { ObjectId } = require('mongodb');

let subtaskRoutes = express.Router();
 
subtaskRoutes.route("/subtasks").get(async (request, response) => {
    try {
        let db = database.getdb();
        let data = await db.collection("sub_tasks").find({}).toArray();
        if (data.length > 0) {
            response.status(200).json(data);
        } else {
            response.status(404).json({ error: "No subtasks found" });
        }
    } catch (error) {
        console.error('Error fetching subtasks:', error);
        response.status(500).json({ error: "Internal server error" });
    }
});

subtaskRoutes.route("/subtasks/:id").get(async (request, response) => {
    try {
        let db = database.getdb();
        let data = await db.collection("sub_tasks").findOne({ _id: new ObjectId(request.params.id) });
        if (data) {
            response.status(200).json(data);
        } else {
            response.status(404).json({ error: "Subtask not found" });
        }
    } catch (error) {
        console.error('Error fetching subtask:', error);
        response.status(500).json({ error: "Internal server error" });
    }
});

subtaskRoutes.route("/subtasks").post(async (request, response) => {
    try {
        console.log('=== BACKEND SUBTASK CREATION ===');
        console.log('Full request body:', JSON.stringify(request.body, null, 2));
        console.log('parentTaskId from body:', request.body.parentTaskId);
        console.log('Type of parentTaskId:', typeof request.body.parentTaskId);
        
        let db = database.getdb();
        
        // Explicitly handle parentTaskId
        const parentTaskId = request.body.parentTaskId;
        if (!parentTaskId) {
            return response.status(400).json({ error: "parentTaskId is required" });
        }
        
        let newSubtask = {
            title: request.body.title,
            text: request.body.text,
            parentTaskId: parentTaskId, // Use the explicit variable
            completed: Boolean(request.body.completed) || false,
            createdAt: request.body.createdAt || new Date(),
            points: Number(request.body.points) || 0,
            userId: request.body.userId
        };
        
        console.log('Subtask object before inserting:', JSON.stringify(newSubtask, null, 2));
        
        let result = await db.collection("sub_tasks").insertOne(newSubtask);
        const insertedSubtask = await db.collection("sub_tasks").findOne({ _id: result.insertedId });
        
        console.log('Inserted subtask from DB:', JSON.stringify(insertedSubtask, null, 2));
        
        response.status(201).json(insertedSubtask);
    } catch (error) {
        console.error('Error creating subtask:', error);
        response.status(500).json({ error: "Internal server error", details: error.message });
    }
});

// Add update and delete routes
subtaskRoutes.route("/subtasks/:id").put(async (request, response) => {
    try {
        let db = database.getdb();
        
        // Only update fields that are provided in the request
        let updateData = { $set: {} };
        
        if (request.body.title !== undefined) {
            updateData.$set.title = request.body.title;
        }
        if (request.body.text !== undefined) {
            updateData.$set.text = request.body.text;
        }
        if (request.body.completed !== undefined) {
            updateData.$set.completed = request.body.completed;
        }
        if (request.body.parentTaskId !== undefined) {
            updateData.$set.parentTaskId = request.body.parentTaskId;
        }
        
        let result = await db.collection("sub_tasks").updateOne(
            { _id: new ObjectId(request.params.id) }, 
            updateData
        );
        
        // Return the updated document
        const updatedSubtask = await db.collection("sub_tasks").findOne({ _id: new ObjectId(request.params.id) });
        response.status(200).json(updatedSubtask);
    } catch (error) {
        console.error('Error updating subtask:', error);
        response.status(500).json({ error: "Internal server error" });
    }
});

subtaskRoutes.route("/subtasks/:id").delete(async (request, response) => {
    try {
        let db = database.getdb();
        let result = await db.collection("sub_tasks").deleteOne({ _id: new ObjectId(request.params.id) });
        response.status(200).json({ message: "Subtask deleted successfully" });
    } catch (error) {
        console.error('Error deleting subtask:', error);
        response.status(500).json({ error: "Internal server error" });
    }
});

module.exports = subtaskRoutes;