import type { Subtask } from './Subtask';

export interface Tag {
	label: string;
	color?: string; // hex color like #RRGGBB
}

export interface Task {
	id: string;
	title: string;
	text: string;
	points: number;
	completed: boolean;
	subtasks: Subtask[];
	expanded: boolean;
	assignedToId?: string;
	/** The user ID of who created this task */
	userId?: string;
	dueDate?: string;
	/** Optional tags attached to the task */
	tags?: Tag[];
}

export interface TaskDictionary {
	[taskId: string]: Task;
}
