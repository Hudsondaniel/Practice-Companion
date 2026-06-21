import { mapSyncError } from '@/lib/errors'
import { supabase } from '@/lib/supabase'
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
  if (!parsed) return null

  return { snapshot: parsed, updated_at: row.updated_at }
}

export async function saveCloudSnapshot(userId: string, snapshot: AppSnapshot): Promise<string> {
  const updated_at = new Date().toISOString()
  const row = {
    user_id: userId,
    snapshot: snapshot as unknown as Json,
    updated_at,
  }
  const { error } = await (
    supabase.from('user_app_snapshots') as unknown as {
      upsert: (values: typeof row[]) => Promise<{ error: { message: string } | null }>
    }
  ).upsert([row])

  if (error) throw new Error(mapSyncError(error.message))
  return updated_at
}

/** Load practice data from Supabase only — no local fallback. */
export async function loadUserDataFromCloud(userId: string): Promise<string> {
  const cloud = await loadCloudSnapshot(userId)

  if (cloud && !snapshotIsEmpty(cloud.snapshot)) {
    hydrateAppSnapshot(cloud.snapshot)
    return cloud.updated_at
  }

  const empty = createEmptyAppSnapshot()
  hydrateAppSnapshot(empty)
  return saveCloudSnapshot(userId, empty)
}

export async function pushLocalSnapshot(userId: string): Promise<string> {
  return saveCloudSnapshot(userId, collectAppSnapshot())
}

export async function pullCloudSnapshot(userId: string): Promise<void> {
  await loadUserDataFromCloud(userId)
}
