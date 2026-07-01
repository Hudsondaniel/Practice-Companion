import type { AppSnapshot } from '@/types/app-snapshot'
import {
  collectAppSnapshot,
  parseAppSnapshot,
  snapshotIsEmpty,
} from '@/lib/supabase-sync/snapshot'

const STORAGE_KEY = 'pc-app-snapshot-backup'
const LEGACY_SESSION_KEY = 'pc-app-snapshot-backup'

interface BackupEnvelope {
  userId: string
  savedAt: string
  snapshot: AppSnapshot
}

function migrateLegacySessionBackup(): void {
  try {
    const legacy = sessionStorage.getItem(LEGACY_SESSION_KEY)
    if (!legacy || localStorage.getItem(STORAGE_KEY)) return
    localStorage.setItem(STORAGE_KEY, legacy)
    sessionStorage.removeItem(LEGACY_SESSION_KEY)
  } catch {
    // ignore
  }
}

function readEnvelope(): BackupEnvelope | null {
  migrateLegacySessionBackup()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
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
      localStorage.removeItem(STORAGE_KEY)
      return
    }
    const envelope: BackupEnvelope = {
      userId,
      savedAt: new Date().toISOString(),
      snapshot,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope))
  } catch {
    // localStorage may be unavailable in private mode — cloud save is the fallback.
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
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(LEGACY_SESSION_KEY)
  } catch {
    // ignore
  }
}
