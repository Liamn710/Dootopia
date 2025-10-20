import axios from 'axios';
const API_URL = 'http://192.168.1.112:3000'; // Adjust the URL as needed
// User API   *************************************************************************** 
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

export const getMongoUserByFirebaseId = async (firebaseUserId) => {
  try {
    const response = await axios.get(`${API_URL}/users/firebase/${firebaseUserId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching MongoDB user:', error);
    throw error;
  }
};

export const getMongoUserByEmail = async (email) => {
    const response = await axios.get(`${API_URL}/users/email/${email}`);
    return response.data;
};

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

// task API***************************************************************************

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

// reward API***************************************************************************

export async function getRewards() {
    const response = await axios.get(`${API_URL}/rewards`);
    if (response.status === 200) {
        return response.data;
    }
    else {
        return { error: "No rewards found" };
    }
}

export async function getRewardById(id) {
    const response = await axios.get(`${API_URL}/rewards/${id}`);
    if (response.status === 200) {
        return response.data;
    }
    else {
        return { error: "Reward not found" };
    }
}

export async function createReward(reward) {
    const response = await axios.post(`${API_URL}/rewards`, reward);
    if (response.status === 201) {
        return response.data;
    }
    else {
        return { error: "Reward creation failed" };
    }
}

export async function updateReward(id, reward) {
    const response = await axios.put(`${API_URL}/rewards/${id}`, reward);
    if (response.status === 200) {
        return response.data;
    }
    else {
        return { error: "Reward update failed" };
    }
}

export async function deleteReward(id) {
    const response = await axios.delete(`${API_URL}/rewards/${id}`);
    if (response.status === 200) {
        return { message: "Reward deleted successfully" };
    }
    else {
        return { error: "Reward deletion failed" };
    }
}
// list API***************************************************************************

export async function getLists() {
    const response = await axios.get(`${API_URL}/lists`);
    if (response.status === 200) {
        return response.data;
    }
    else {
        return { error: "No lists found" };
    }
}

export async function getListById(id) {
    const response = await axios.get(`${API_URL}/lists/${id}`);
    if (response.status === 200) {
        return response.data;
    }
    else {
        return { error: "List not found" };
    }
}

export async function createList(list) {
    const response = await axios.post(`${API_URL}/lists`, list);
    if (response.status === 201) {
        return response.data;
    }
    else {
        return { error: "List creation failed" };
    }
}

export async function updateList(id, list) {
    const response = await axios.put(`${API_URL}/lists/${id}`, list);
    if (response.status === 200) {
        return response.data;
    }
    else {
        return { error: "List update failed" };
    }
}

export async function deleteList(id) {
    const response = await axios.delete(`${API_URL}/lists/${id}`);
    if (response.status === 200) {
        return { message: "List deleted successfully" };
    }
    else {
        return { error: "List deletion failed" };
    }
}


// subtask API***************************************************************************
export async function getSubtasks() {
    const response = await axios.get(`${API_URL}/subtasks`);
    if (response.status === 200) {
        return response.data;
    }
    else {
        return { error: "No subtasks found" };
    }
}

export async function getSubtaskById(id) {
    const response = await axios.get(`${API_URL}/subtasks/${id}`);
    if (response.status === 200) {
        return response.data;
    }
    else {
        return { error: "Subtask not found" };
    }
}

export async function createSubtask(subtask) {
    const response = await axios.post(`${API_URL}/subtasks`, subtask);
    if (response.status === 201) {
        return response.data;
    }
    else {
        return { error: "Subtask creation failed" };
    }
}

export async function updateSubtask(id, subtask) {
    const response = await axios.put(`${API_URL}/subtasks/${id}`, subtask);
    if (response.status === 200) {
        return response.data;
    }
    else {
        return { error: "Subtask update failed" };
    }
}

export async function deleteSubtask(id) {
    const response = await axios.delete(`${API_URL}/subtasks/${id}`);
    if (response.status === 200) {
        return { message: "Subtask deleted successfully" };
    }
    else {
        return { error: "Subtask deletion failed" };
    }
}
