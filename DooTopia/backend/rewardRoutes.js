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
    let db = database.getdb();
    let data = await db.collection("rewards").findOne({ _id: ObjectId(request.params.id) });
    if (data) {
        response.status(200).json(data);
    } else {
        response.status(404).json({ error: "Reward not found" });
    }
});

rewardRoutes.route("/rewards").post(async (request, response) => {
    let db = database.getdb();
    let newReward = {
        title: request.body.title,
        points: request.body.points,
        description: request.body.description,
        userId: request.body.userId
    };
    let result = await db.collection("rewards").insertOne(newReward);
    response.status(201).json(result.ops[0]);
});

rewardRoutes.route("/rewards/:id").put(async (request, response) => {
    let db = database.getdb();
    let updatedReward = {
        title: request.body.title,
        points: request.body.points,
        description: request.body.description
    };
    let result = await db.collection("rewards").updateOne({ _id: ObjectId(request.params.id) }, { $set: updatedReward });
    if (result.modifiedCount > 0) {
        response.status(200).json({ message: "Reward updated successfully" });
    } else {
        response.status(404).json({ error: "Reward not found" });
    }
});

rewardRoutes.route("/rewards/:id").delete(async (request, response) => {
    let db = database.getdb();
    let result = await db.collection("rewards").deleteOne({ _id: ObjectId(request.params.id) });
    if (result.deletedCount > 0) {
        response.status(200).json({ message: "Reward deleted successfully" });
    } else {
        response.status(404).json({ error: "Reward not found" });
    }
});

module.exports = rewardRoutes;
