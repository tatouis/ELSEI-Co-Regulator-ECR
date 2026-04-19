import { prisma } from './prisma';

export const logger = {
  async info(category: string, message: string, metadata?: any, userId?: string) {
    return this.log('info', category, message, metadata, userId);
  },

  async warn(category: string, message: string, metadata?: any, userId?: string) {
    return this.log('warn', category, message, metadata, userId);
  },

  async error(category: string, message: string, metadata?: any, userId?: string) {
    return this.log('error', category, message, metadata, userId);
  },

  async success(category: string, message: string, metadata?: any, userId?: string) {
    return this.log('success', category, message, metadata, userId);
  },

  async log(level: string, category: string, message: string, metadata?: any, userId?: string) {
    try {
      console.log(`[${level.toUpperCase()}] [${category}] ${message}`);
      
      return await prisma.systemLog.create({
        data: {
          level,
          category,
          message,
          metadata: metadata ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata)) : null,
          userId
        }
      });
    } catch (err) {
      console.error('Logging failed:', err);
    }
  }
};
