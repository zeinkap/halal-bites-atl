export interface BackupStatus {
  lastBackup: Date | null;
  status: 'success' | 'warning' | 'error';
  message: string;
}

export interface BackupRecord {
  id: string;
  createdAt: Date;
  filename: string;
  size: number;
  status: 'success' | 'error';
  error?: string;
} 