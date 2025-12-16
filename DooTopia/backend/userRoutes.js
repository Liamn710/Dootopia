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
        firebaseUserId: request.body.firebaseUserId,
        name: request.body.name,
        email: request.body.email,
        points: request.body.points,
        createdAt: request.body.createdAt,
        inventory: request.body.inventory || [],
        selectedAvatarId: request.body.selectedAvatarId || null,
        selectedAvatarUrl: request.body.selectedAvatarUrl || null
    }
    let data = await db.collection("users").insertOne(mongoObject);
    response.status(201).json({message: "User created successfully", userId: data.insertedId});
    });

    // get user by firebaseUserId
userRoutes.route("/users/firebase/:firebaseUserId").get(async (request, response) => {
    let db = database.getdb();
    let data = await db.collection("users").findOne({ firebaseUserId: request.params.firebaseUserId });
    if (data) {
        response.status(200).json(data);
    } else {
        response.status(404).json({ error: "User not found" });
    }
});
// get user by email
userRoutes.route("/users/email/:email").get(async (request, response) => {
    let db = database.getdb();
    let data = await db.collection("users").findOne({ email: request.params.email });
    if (data) {
        response.status(200).json(data);
    } else {
        response.status(404).json({ error: "User not found" });
    }
});
//update user by id
userRoutes.route("/users/:id").put(async (request, response) => {
    let db = database.getdb();
    let id = request.params.id;
    let updateObject = request.body; // Accepts $inc

    let result = await db.collection("users").updateOne(
        { _id: new ObjectId(id) },
        updateObject // This allows $inc, $set, etc.
    );
    if (result.modifiedCount > 0) {
        response.status(200).json({ message: "User updated successfully" });
    } else {
        response.status(404).json({ error: "User not found or not updated" });
    }
});

userRoutes.route("/users/:id/avatar").put(async (request, response) => {
    try {
        const db = database.getdb();
        const id = request.params.id;
        const { prizeId } = request.body;

        if (!prizeId) {
            return response.status(400).json({ error: "Missing prizeId" });
        }

        let userObjectId;
        try {
            userObjectId = new ObjectId(id);
        } catch (error) {
            return response.status(400).json({ error: "Invalid user id" });
        }
        const user = await db.collection("users").findOne({ _id: userObjectId });

        if (!user) {
            return response.status(404).json({ error: "User not found" });
        }

        const inventory = Array.isArray(user.inventory)
            ? user.inventory.map((item) => item?.toString())
            : [];

        if (!inventory.includes(prizeId)) {
            return response.status(403).json({ error: "Avatar not owned by user" });
        }

        let prizeObjectId;
        try {
            prizeObjectId = new ObjectId(prizeId);
        } catch (error) {
            return response.status(400).json({ error: "Invalid prizeId" });
        }

        const prize = await db.collection("prizes").findOne({ _id: prizeObjectId });

        if (!prize) {
            return response.status(404).json({ error: "Avatar not found" });
        }

        const avatarPayload = {
            selectedAvatarId: prizeId,
            selectedAvatarUrl: prize.imageUrl || null
        };

        await db.collection("users").updateOne(
            { _id: userObjectId },
            { $set: avatarPayload }
        );

        response.status(200).json({ message: "Avatar updated successfully", ...avatarPayload });
    } catch (error) {
        console.error("Error updating avatar", error);
        response.status(500).json({ error: "Failed to update avatar" });
    }
});
//delete user by id
userRoutes.route("/users/:id").delete(async(request,response) => {
    let db = database.getdb();
    let data = await db.collection("users").deleteOne({_id: new ObjectId(request.params.id)});
    response.status(200).json({data: data, message: "User deleted successfully"});
})

module.exports = userRoutes;