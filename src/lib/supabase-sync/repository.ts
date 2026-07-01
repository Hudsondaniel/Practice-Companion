import { mapSyncError } from '@/lib/errors'
import { supabase } from '@/lib/supabase'
import { readLocalBackup } from '@/lib/supabase-sync/local-backup'
import {
  mergeAppSnapshots,
  reconcileSnapshot,
  snapshotHasMorePracticeData,
} from '@/lib/supabase-sync/merge-snapshot'
import {
  collectAppSnapshot,
  createEmptyAppSnapshot,
  hydrateAppSnapshot,
  parseAppSnapshot,
  snapshotIsEmpty,
} from '@/lib/supabase-sync/snapshot'
import type { AppSnapshot } from '@/types/app-snapshot'
import type { Json } from '@/types/database'

export interface CloudSnapshotRow {
  snapshot: AppSnapshot
  updated_at: string
}

type SnapshotDbRow = {
  snapshot: Json
  updated_at: string
}

export async function loadCloudSnapshot(userId: string): Promise<CloudSnapshotRow | null> {
  const { data, error } = await supabase
    .from('user_app_snapshots')
    .select('snapshot, updated_at')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw new Error(mapSyncError(error.message))
  const row = data as SnapshotDbRow | null
  if (!row) return null

  const parsed = parseAppSnapshot(row.snapshot)
  if (parsed) {
    return { snapshot: parsed, updated_at: row.updated_at }
  }

  // Signup trigger stores `{}` before first real save — treat as empty account.
  return { snapshot: createEmptyAppSnapshot(), updated_at: row.updated_at }
}

export async function saveCloudSnapshot(userId: string, snapshot: AppSnapshot): Promise<string> {
  const updated_at = new Date().toISOString()
  const payload = {
    user_id: userId,
    snapshot: snapshot as unknown as Json,
    updated_at,
  }
  const { error } = await supabase
    .from('user_app_snapshots')
    .upsert(payload as never, { onConflict: 'user_id' })

  if (error) throw new Error(mapSyncError(error.message))
  return updated_at
}

/** Load practice data from Supabase, merging with local memory or backup so practice history is not lost. */
export async function loadUserDataFromCloud(userId: string): Promise<string> {
  const local = collectAppSnapshot()
  const backup = readLocalBackup(userId)
  const cloud = await loadCloudSnapshot(userId)

  const bestLocal = !snapshotIsEmpty(local) ? local : backup

  if (cloud && !snapshotIsEmpty(cloud.snapshot)) {
    const merged = bestLocal
      ? mergeAppSnapshots(cloud.snapshot, bestLocal)
      : reconcileSnapshot(cloud.snapshot)
    hydrateAppSnapshot(merged)
    if (bestLocal && snapshotHasMorePracticeData(merged, cloud.snapshot)) {
      return saveCloudSnapshot(userId, collectAppSnapshot())
    }
    return cloud.updated_at
  }

  if (bestLocal) {
    const reconciled = reconcileSnapshot(bestLocal)
    hydrateAppSnapshot(reconciled)
    return saveCloudSnapshot(userId, collectAppSnapshot())
  }

  if (cloud?.snapshot) {
    const parsed = parseAppSnapshot(cloud.snapshot)
    if (parsed && !snapshotIsEmpty(parsed)) {
      hydrateAppSnapshot(reconcileSnapshot(parsed))
      return cloud.updated_at
    }
  }

  const empty = createEmptyAppSnapshot()
  hydrateAppSnapshot(empty)

  if (cloud) {
    return saveCloudSnapshot(userId, collectAppSnapshot())
  }

  return saveCloudSnapshot(userId, empty)
}

export async function pushLocalSnapshot(userId: string): Promise<string> {
  return saveCloudSnapshot(userId, collectAppSnapshot())
}

export async function pullCloudSnapshot(userId: string): Promise<void> {
  await loadUserDataFromCloud(userId)
}
