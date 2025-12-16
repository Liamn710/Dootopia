import axios from 'axios';
const API_URL = 'http://localhost:3000'; // Adjust the URL as needed
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

export async function selectUserAvatar(id, prizeId) {
    const response = await axios.put(`${API_URL}/users/${id}/avatar`, { prizeId });
    if (response.status === 200) {
        return response.data;
    }
    else {
        return { error: "Avatar update failed" };
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

export async function getListsByUserId(userId) {
    try {
        const response = await axios.get(`${API_URL}/lists/user/${userId}`);
        if (response.status === 200) {
            return response.data;
        }
        return [];
    } catch (error) {
        // Return empty array if 404 (no lists found) instead of throwing
        if (error.response && error.response.status === 404) {
            return [];
        }
        console.error('Error fetching lists by user:', error);
        return [];
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

export async function updateListName(id, name) {
    try {
        const response = await axios.put(`${API_URL}/lists/${id}`, { name });
        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error('Failed to update list name');
        }
    } catch (error) {
        console.error('Error updating list name:', error);
        throw error;
    }
}

export async function addTaskToList(listId, taskId) {
    try {
        const response = await axios.post(`${API_URL}/lists/${listId}/tasks`, { taskId });
        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error('Failed to add task to list');
        }
    } catch (error) {
        console.error('Error adding task to list:', error);
        throw error;
    }
}

export async function removeTaskFromList(listId, taskId) {
    try {
        const response = await axios.delete(`${API_URL}/lists/${listId}/tasks/${taskId}`);
        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error('Failed to remove task from list');
        }
    } catch (error) {
        console.error('Error removing task from list:', error);
        throw error;
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
    try {
        const response = await axios.post(`${API_URL}/subtasks`, subtask);
        if (response.status === 201) {
            return response.data;
        } else {
            throw new Error('Failed to create subtask');
        }
    } catch (error) {
        console.error('Error creating subtask:', error);
        throw error;
    }
}

export async function updateSubtask(id, subtask) {
    try {
        const response = await axios.put(`${API_URL}/subtasks/${id}`, subtask);
        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error('Failed to update subtask');
        }
    } catch (error) {
        console.error('Error updating subtask:', error);
        throw error;
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

// prize API***************************************************************************

export async function getPrizes() {
    const response = await axios.get(`${API_URL}/prizes`);
    if (response.status === 200) {
        return response.data;
    }
    else {
        return { error: "No prizes found" };
    }
}

export async function getPrizeById(id) {
    const response = await axios.get(`${API_URL}/prizes/${id}`);
    if (response.status === 200) {
        return response.data;
    }
    else {
        return { error: "Prize not found" };
    }
}

export async function createPrize(prize) {
    try {
        const response = await axios.post(`${API_URL}/prizes`, prize);
        if (response.status === 201) {
            return response.data;
        } else {
            throw new Error('Failed to create prize');
        }
    } catch (error) {
        console.error('Error creating prize:', error);
        throw error;
    }
}

export async function updatePrize(id, prize) {
    try {
        const response = await axios.put(`${API_URL}/prizes/${id}`, prize);
        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error('Failed to update prize');
        }
    } catch (error) {
        console.error('Error updating prize:', error);
        throw error;
    }
}

export async function deletePrize(id) {
    const response = await axios.delete(`${API_URL}/prizes/${id}`);
    if (response.status === 200) {
        return { message: "Prize deleted successfully" };
    }
    else {
        return { error: "Prize deletion failed" };
    }
}