import { prisma } from '@/lib/prisma';
import { BackupStatus } from '@/types/backup';
import { sendEmail } from '@/lib/email';

const BACKUP_WARNING_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const BACKUP_ERROR_THRESHOLD = 48 * 60 * 60 * 1000; // 48 hours in milliseconds

export async function checkBackupStatus(): Promise<BackupStatus> {
  const lastBackup = await prisma.backup.findFirst({
    orderBy: { createdAt: 'desc' }
  });

  if (!lastBackup) {
    return {
      lastBackup: null,
      status: 'error',
      message: 'No backups found'
    };
  }

  const timeSinceLastBackup = Date.now() - lastBackup.createdAt.getTime();

  if (timeSinceLastBackup > BACKUP_ERROR_THRESHOLD) {
    const status: BackupStatus = {
      lastBackup: lastBackup.createdAt,
      status: 'error',
      message: 'No backup in the last 48 hours'
    };
    await sendBackupAlert(status);
    return status;
  }

  if (timeSinceLastBackup > BACKUP_WARNING_THRESHOLD) {
    const status: BackupStatus = {
      lastBackup: lastBackup.createdAt,
      status: 'warning',
      message: 'No backup in the last 24 hours'
    };
    await sendBackupAlert(status);
    return status;
  }

  return {
    lastBackup: lastBackup.createdAt,
    status: 'success',
    message: 'Backup system healthy'
  };
}

async function sendBackupAlert(status: BackupStatus) {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (!adminEmail) {
    console.error('Admin email not configured');
    return;
  }

  try {
    await sendEmail({
      to: adminEmail,
      subject: `Backup Alert: ${status.status.toUpperCase()}`,
      text: `
        Backup Status Alert
        
        Status: ${status.status}
        Last Backup: ${status.lastBackup?.toISOString() ?? 'Never'}
        Message: ${status.message}
        
        Please check the backup system and ensure it is functioning correctly.
      `
    });
  } catch (error) {
    console.error('Failed to send backup alert:', error);
  }
} 