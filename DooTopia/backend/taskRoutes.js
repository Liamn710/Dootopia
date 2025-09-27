const express = require('express');
const database = require('./connect');
const { ObjectId } = require('mongodb');

let taskRoutes = express.Router();
// get all tasks
taskRoutes.route("/tasks").get(async(request,response) => {
    let db = database.getdb();
    let data = await db.collection("tasks").find({}).toArray();
    if (data.length > 0){
        response.status(200).json(data);
    }
    else {
        response.status(404).json({error: "No tasks found"});
    }
})
taskRoutes.route("/tasks/:id").get(async(request,response) => {
    let db = database.getdb();
    let data = await db.collection("tasks").findOne({_id: new ObjectId(request.params.id)});
    if (Object.keys(data).length > 0){
        response.status(200).json(data);
    }
    else {
        response.status(404).json({error: "Task not found"});
    }
})
//create a new task
taskRoutes.route("/tasks").post(async (request, response) => {
    let db = database.getdb();
    let mongoObject = { 
        title: request.body.title,
        text: request.body.text,
        completed: request.body.completed,
        createdAt: request.body.createdAt,
        points: request.body.points,
        userId: request.body.userId
    };
    let data = await db.collection("tasks").insertOne(mongoObject);

    // Fetch the inserted document using its _id
    const insertedTask = await db.collection("tasks").findOne({ _id: data.insertedId });

    response.status(201).json(insertedTask);
});
//update task by id
taskRoutes.route("/tasks/:id").put(async (request, response) => {
    let db = database.getdb();
    let id = request.params.id;
    let updateObject = { $set: request.body };

    // If your tasks use string IDs:
    let result = await db.collection("tasks").updateOne({ _id: new ObjectId(id) }, updateObject);
    if (result.modifiedCount > 0) {
        response.status(200).json({ message: "Task updated successfully" });
    } else {
        response.status(404).json({ error: "Task not found or not updated" });
    }
});

//delete task by id
taskRoutes.route("/tasks/:id").delete(async(request,response) => {
    let db = database.getdb();
    let data = await db.collection("tasks").deleteOne({_id: new ObjectId(request.params.id)});
    response.status(200).json({data: data, message: "Task deleted successfully"});
})

module.exports = taskRoutes;