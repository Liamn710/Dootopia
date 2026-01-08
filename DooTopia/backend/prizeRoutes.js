const express = require('express');
const database = require('./connect');
const { ObjectId } = require('mongodb');

let prizeRoutes = express.Router();

prizeRoutes.route("/prizes").get(async (request, response) => {
    let db = database.getdb();
    const userId = request.query.userId;
    const query = userId ? { userId } : {};
    let data = await db.collection("prizes").find(query).toArray();
    if (data.length > 0) {
        response.status(200).json(data);
    } else {
        response.status(404).json({ error: "No prizes found" });
    }
});

prizeRoutes.route("/prizes/:id").get(async (request, response) => {
    let db = database.getdb();
    let data = await db.collection("prizes").findOne({ _id: ObjectId(request.params.id) });
    if (data) {
        response.status(200).json(data);
    } else {
        response.status(404).json({ error: "prize not found" });
    }
});

prizeRoutes.route("/prizes").post(async (request, response) => {
    let db = database.getdb();
    let newprize = {
        userId: request.body.userId,
        title: request.body.title,
        subtitle: request.body.subtitle,
        content: request.body.content, 
        pointsRequired: request.body.pointsRequired || 0,
        imageUrl: request.body.imageUrl,
        isCompleted: false,
        createdAt: new Date()
    };
    let result = await db.collection("prizes").insertOne(newprize);
    response.status(201).json(result);
});

prizeRoutes.route("/prizes/:id").put(async (request, response) => {
    let db = database.getdb();
    let updatedprize = {
        title: request.body.title,
        subtitle: request.body.subtitle,
        content: request.body.content, 
        pointsRequired: request.body.pointsRequired,
        imageUrl: request.body.imageUrl,
        isCompleted: request.body.isCompleted
    };
    let result = await db.collection("prizes").updateOne({ _id: new ObjectId(request.params.id) }, { $set: updatedprize });
    if (result.modifiedCount > 0) {
        response.status(200).json({ message: "prize updated successfully" });
    } else {
        response.status(404).json({ error: "prize not found" });
    }
});

prizeRoutes.route("/prizes/:id").delete(async (request, response) => {
    let db = database.getdb();
    let result = await db.collection("prizes").deleteOne({ _id: ObjectId(request.params.id) });
    if (result.deletedCount > 0) {
        response.status(200).json({ message: "prize deleted successfully" });
    } else {
        response.status(404).json({ error: "prize not found" });
    }
});

module.exports = prizeRoutes;
