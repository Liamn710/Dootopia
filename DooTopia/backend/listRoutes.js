const express = require('express');
const database = require('./connect');
const { ObjectId } = require('mongodb');

let listRoutes = express.Router();

listRoutes.route("/lists").get(async (request, response) => {
    let db = database.getdb();
        let data = await db.collection("lists").find({}).toArray();
        if (data.length > 0){
            response.status(200).json(data);
        }
        else {
            response.status(404).json({error: "No lists found"});
        }
    })

listRoutes.route("/lists/:id").get(async (request, response) => {
    let db = database.getdb();
    let data = await db.collection("lists").findOne({ _id: ObjectId(request.params.id) });
    if (Object.keys(data).length > 0){
        response.status(200).json(data);
    }
    else {
        response.status(404).json({ error: "List not found" });
    }
});

listRoutes.route("/lists").post(async (request, response) => {
    let db = database.getdb();
    let newList = {
        title: request.body.title
    };
    let result = await db.collection("lists").insertOne(newList);
    response.status(201).json(result.ops[0]);
});

listRoutes.route("/lists/:id").put(async (request, response) => {
    let db = database.getdb();
    let updatedList = {
        title: request.body.title
    };
    let result = await db.collection("lists").updateOne({ _id: ObjectId(request.params.id) }, { $set: updatedList });
    if (result.modifiedCount > 0) {
        response.status(200).json({ message: "List updated successfully" });
    } else {
        response.status(404).json({ error: "List not found" });
    }
});

listRoutes.route("/lists/:id").delete(async (request, response) => {
    let db = database.getdb();
    let result = await db.collection("lists").deleteOne({ _id: ObjectId(request.params.id) });
    if (result.deletedCount > 0) {
        response.status(200).json({ message: "List deleted successfully" });
    } else {
        response.status(404).json({ error: "List not found" });
    }
});

module.exports = listRoutes;