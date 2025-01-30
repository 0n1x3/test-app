import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from '../schemas/task.schema';
import { UserEntity, UserDocument } from '../schemas/user.schema';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(UserEntity.name) private userModel: Model<UserDocument>
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

  async completeTask(userId: number, taskId: string): Promise<UserEntity> {
    const task = await this.taskModel.findById(taskId);
    if (!task || task.completedBy.get(userId.toString())) {
      throw new Error('Task already completed or not found');
    }

    // Обновляем задание
    task.completedBy.set(userId.toString(), true);
    await task.save();

    // Обновляем пользователя
    const user = await this.userModel.findOne({ telegramId: userId });
    if (!user) {
      throw new Error('User not found');
    }

    user.balance += task.reward;
    user.experience += task.reward;
    
    // Проверяем уровень
    const newLevel = Math.floor(user.experience / 1000) + 1;
    if (newLevel > user.level) {
      user.level = newLevel;
    }

    return user.save();
  }

  async initDefaultTasks(): Promise<Task[]> {
    console.log('Starting initDefaultTasks');
    
    // Удаляем все существующие задачи
    const deleteResult = await this.taskModel.deleteMany({});
    console.log('Deleted tasks:', deleteResult);

    // Создаем новые задачи
    const defaultTasks = [
      {
        title: 'First Task',
        description: 'Complete your first game',
        reward: 1000,
        type: 'FIRST_GAME',
        isActive: true,
        completedBy: new Map()
      }
    ];

    const createdTasks = await this.taskModel.create(defaultTasks);
    console.log('Created tasks:', createdTasks);

    return createdTasks;
  }
} 