export interface Task {
  _id: string;
  title: string;
  description: string;
  reward: number;
  type: string;
  isActive: boolean;
  completedBy: Map<string, boolean>;
} 