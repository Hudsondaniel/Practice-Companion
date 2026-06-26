import type { AppSnapshot } from '@/types/app-snapshot'
import {
  collectAppSnapshot,
  parseAppSnapshot,
  snapshotIsEmpty,
} from '@/lib/supabase-sync/snapshot'

const STORAGE_KEY = 'pc-app-snapshot-backup'

interface BackupEnvelope {
  userId: string
  savedAt: string
  snapshot: AppSnapshot
}

function readEnvelope(): BackupEnvelope | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as BackupEnvelope
    if (!parsed?.userId || !parsed.snapshot) return null
    const snapshot = parseAppSnapshot(parsed.snapshot)
    if (!snapshot) return null
    return { ...parsed, snapshot }
  } catch {
    return null
  }
}

/** Persist in-memory state locally so a crash/reload before cloud save can recover. */
export function writeLocalBackup(userId: string): void {
  try {
    const snapshot = collectAppSnapshot()
    if (snapshotIsEmpty(snapshot)) {
      sessionStorage.removeItem(STORAGE_KEY)
      return
    }
    const envelope: BackupEnvelope = {
      userId,
      savedAt: new Date().toISOString(),
      snapshot,
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(envelope))
  } catch {
    // sessionStorage may be unavailable in private mode — cloud save is the fallback.
  }
}

export function readLocalBackup(userId: string): AppSnapshot | null {
  const envelope = readEnvelope()
  if (!envelope || envelope.userId !== userId) return null
  if (snapshotIsEmpty(envelope.snapshot)) return null
  return envelope.snapshot
}

export function clearLocalBackup(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
