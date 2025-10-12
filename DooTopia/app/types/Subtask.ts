export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
  assignedToId?: string;
}
