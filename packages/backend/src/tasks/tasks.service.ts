import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from '../schemas/task.schema';
import { User } from '../schemas/user.schema';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  async getActiveTasks(userId: number): Promise<Task[]> {
    const tasks = await this.taskModel.find({ isActive: true });
    const user = await this.userModel.findOne({ telegramId: userId });
    
    return tasks.filter(task => !task.completedBy.get(userId.toString()));
  }

  async getCompletedTasks(userId: number): Promise<Task[]> {
    const tasks = await this.taskModel.find();
    return tasks.filter(task => task.completedBy.get(userId.toString()));
  }

  async completeTask(userId: number, taskId: string): Promise<User> {
    const task = await this.taskModel.findById(taskId);
    if (!task || task.completedBy.get(userId.toString())) {
      throw new Error('Task already completed or not found');
    }

    // Обновляем задание
    task.completedBy.set(userId.toString(), true);
    await task.save();

    // Обновляем пользователя
    const user = await this.userModel.findOne({ telegramId: userId });
    user.balance += task.reward;
    user.experience += task.reward;
    
    // Проверяем уровень
    const newLevel = Math.floor(user.experience / 1000) + 1;
    if (newLevel > user.level) {
      user.level = newLevel;
    }

    return user.save();
  }

  async initDefaultTasks() {
    const count = await this.taskModel.countDocuments();
    if (count === 0) {
      await this.taskModel.create({
        title: 'Collect first reward',
        reward: 1000,
        requiredLevel: 1
      });
    }
  }
} 