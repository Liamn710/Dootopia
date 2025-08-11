import axios from 'axios';

const API_URL = 'http://localhost:3000'; // Adjust the URL as needed

export async function getUsers() {
    const response = await axios.get(`${API_URL}/users`);
    if (response.status === 200) {
        return response.data;
    }
    else {
        return { error: "No users found" };
    }
    
}

export async function getUserById(id) {
    const response = await axios.get(`${API_URL}/users/${id}`);
    if (response.status === 200) {
        return response.data;
    }
    else{
        return {error: "User not found"};
    }
    
}

export async function createUser(user) {
    const response = await axios.post(`${API_URL}/users`, user);
    if (response.status === 201) {
        return response.data;
    }
    else {
        return { error: "User creation failed" };
    }
}

export async function updateUser(id, user) {
    const response = await axios.put(`${API_URL}/users/${id}`, user);
    if (response.status === 200) {
        return response.data;
    }
    else {
        return { error: "User update failed" };
    }
}

export async function deleteUser(id) {
    const response = await axios.delete(`${API_URL}/users/${id}`);
    if (response.status === 200) {
        return { message: "User deleted successfully" };
    }
    else {
        return { error: "User deletion failed" };
    }
}   

export async function getTasks() {
    const response = await axios.get(`${API_URL}/tasks`);
    if (response.status === 200) {
        return response.data;
    }
    else {
        return { error: "No tasks found" };
    }
}

export async function getTaskById(id) {
    const response = await axios.get(`${API_URL}/tasks/${id}`);
    if (response.status === 200) {
        return response.data;
    }
    else {
        return { error: "Task not found" };
    }
}

export async function createTask(task) {
    const response = await axios.post(`${API_URL}/tasks`, task);
    if (response.status === 201) {
        return response.data;
    }
    else {
        return { error: "Task creation failed" };
    }
}

export async function updateTask(id, task) {
    const response = await axios.put(`${API_URL}/tasks/${id}`, task);
    if (response.status === 200) {
        return response.data;
    }
    else {
        return { error: "Task update failed" };
    }
}

export async function deleteTask(id) {
    const response = await axios.delete(`${API_URL}/tasks/${id}`);
    if (response.status === 200) {
        return { message: "Task deleted successfully" };
    }
    else {
        return { error: "Task deletion failed" };
    }
}