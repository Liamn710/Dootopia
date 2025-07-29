const express = require('express');
const database = require('./connect');
const { ObjectId } = require('mongodb');

let userRoutes = express.Router();
// get all users
userRoutes.route("/users").get(async(request,response) => {
    let db = database.getdb();
    let data = await db.collection("users").find({}).toArray();
    if (data.length > 0){
        response.status(200).json(data);
    }
    else {
        response.status(404).json({error: "No users found"});
    }
})
//get user by id
userRoutes.route("/users/:id").get(async(request,response) => {
    let db = database.getdb();
    let data = await db.collection("users").findOne({_id: new ObjectId(request.params.id)});
    if (Object.keys(data).length > 0){
        response.status(200).json(data);
    }
    else {
        response.status(404).json({error: "User not found"});
    }
})
//create a new user
userRoutes.route("/users").post(async(request,response) => {
    let db = database.getdb();
    let mongoObject = { 
        name: request.body.name,
        email: request.body.email,
        points: request.body.points,
        createdAt: request.body.createdAt,
    }
    let data = await db.collection("users").insertOne(mongoObject);
    response.status(201).json({message: "User created successfully", userId: data.insertedId});
    });
//update user by id
userRoutes.route("/users/:id").put(async(request,response) => {
    let db = database.getdb();
    let mongoObject = { 
        $set: {
            name: request.body.name,
            email: request.body.email,
            createdAt: new Date()
        }
    }
    let data = await db.collection("users").updateOne({_id: new ObjectId(request.params.id)}, mongoObject);
    response.status(200).json({message: "User updated successfully", userId: data.insertedId});
    });

//delete user by id
userRoutes.route("/users/:id").delete(async(request,response) => {
    let db = database.getdb();
    let data = await db.collection("users").deleteOne({_id: new ObjectId(request.params.id)});
    response.status(200).json({data: data, message: "User deleted successfully"});
})

module.exports = userRoutes;