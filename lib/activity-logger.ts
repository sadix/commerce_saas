// Activity Logger function for logging activities in the ActivityLog table in the  database
import { prisma } from '@/lib/prisma';

export async function logActivity(action: string, userId: string, details?: Record<string, any>, ipAddress?: string) {
  return await prisma.activityLog.create({
    data: {
      action,
      userId,
      details: details ? JSON.stringify(details) : null,
      ipAddress: ipAddress || null,
    }
  });
}