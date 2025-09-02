const express = require('express');
const database = require('./connect');
const { ObjectId } = require('mongodb');

let subtaskRoutes = express.Router();
 
subtaskRoutes.route("/subtasks").get(async (request, response) => {
    let db = database.getdb();
    let data = await db.collection("sub_tasks").find({}).toArray();
    if (data.length > 0) {
        response.status(200).json(data);
    } else {
        response.status(404).json({ error: "No subtasks found" });
    }
});

subtaskRoutes.route("/subtasks/:id").get(async (request, response) => {
    let db = database.getdb();
    let data = await db.collection("sub_tasks").findOne({ _id: ObjectId(request.params.id) });
    if (data) {
        response.status(200).json(data);
    } else {
        response.status(404).json({ error: "Subtask not found" });
    }
});

subtaskRoutes.route("/subtasks").post(async (request, response) => {
    let db = database.getdb();
    let newSubtask = {
        title: request.body.title,
        text: request.body.text,
        parentTaskId: request.body.parentTaskId,
        completed: request.body.completed,
        createdAt: request.body.createdAt,
        points: request.body.points,
        userId: request.body.userId
    };
    let result = await db.collection("sub_tasks").insertOne(newSubtask);
    response.status(201).json(result.ops[0]);
});

module.exports = subtaskRoutes;