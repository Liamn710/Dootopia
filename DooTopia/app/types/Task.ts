import type { Subtask } from './Subtask';

export interface Task {
	id: string;
	title: string;
	text: string;
	points: number;
	completed: boolean;
	subtasks: Subtask[];
	expanded: boolean;
	assignedToId?: string;
	dueDate?: string;
}

export interface TaskDictionary {
	[taskId: string]: Task;
}
