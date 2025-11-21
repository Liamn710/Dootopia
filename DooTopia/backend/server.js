const connect = require("./connect");
const express = require("express");
const cors = require("cors");
const users = require("./userRoutes");
const tasks = require("./taskRoutes");
const lists = require("./listRoutes");
const rewards = require("./rewardRoutes");
const subtasks = require("./subtaskRoutes");
const prizeRoutes = require("./prizeRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(users);
app.use(tasks);
app.use(lists);
app.use(rewards);
app.use(subtasks);
app.use(prizeRoutes);

app.listen(PORT, '0.0.0.0', () => {
    connect.connectToServer()
    console.log(`Server is running on port ${PORT}`);
})