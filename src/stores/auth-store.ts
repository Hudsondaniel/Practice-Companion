import { create } from 'zustand'
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'
import { mapSaveError, mapSyncError } from '@/lib/errors'
import {
  AUTH_ACCOUNT_EXISTS,
  AUTH_CONFIRM_EMAIL,
  mapAuthError as mapAuthErr,
} from '@/lib/auth-errors'
import { supabase } from '@/lib/supabase'
import { clearLocalBackup, readLocalBackup, writeLocalBackup } from '@/lib/supabase-sync/local-backup'
import { loadUserDataFromCloud, pushLocalSnapshot } from '@/lib/supabase-sync/repository'
import { hydrateAppSnapshot, resetAllStores } from '@/lib/supabase-sync/snapshot'
import { useAdherenceStore } from '@/stores/adherence-store'
import { useGuidedSessionStore } from '@/stores/guided-session-store'
import { usePracticeStore } from '@/stores/practice-store'
import { useSessionToolsStore } from '@/stores/session-tools-store'
import { useStreakStore } from '@/stores/streak-store'
import { useTranscriptionStore } from '@/stores/transcription-store'

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline'

interface AuthState {
  session: Session | null
  user: User | null
  loading: boolean
  /** True after cloud data loaded successfully for the signed-in user */
  dataReady: boolean
  syncStatus: SyncStatus
  lastSyncedAt: string | null
  syncError: string | null
  /** Save failures — app stays usable; banner shows this message */
  saveError: string | null

  initialize: () => () => void
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  syncNow: () => Promise<void>
  flushPendingSave: () => Promise<void>
  reloadFromCloud: () => Promise<void>
  setSyncStatus: (status: SyncStatus, error?: string | null) => void
}

let saveTimer: ReturnType<typeof setTimeout> | null = null
let backupTimer: ReturnType<typeof setTimeout> | null = null
let storeUnsubs: (() => void)[] = []
let syncInFlight: Promise<void> | null = null
let syncInFlightUserId: string | null = null
let hydratedUserId: string | null = null
let saveInFlight: Promise<void> | null = null

function deferAuthSideEffect(fn: () => void): void {
  // Supabase auth deadlocks if you call the client from inside onAuthStateChange synchronously.
  queueMicrotask(fn)
}

const SYNC_STORES = [
  usePracticeStore,
  useTranscriptionStore,
  useAdherenceStore,
  useStreakStore,
  useSessionToolsStore,
  useGuidedSessionStore,
] as const

function clearAutoSave(): void {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = null
  if (backupTimer) clearTimeout(backupTimer)
  backupTimer = null
  for (const unsub of storeUnsubs) unsub()
  storeUnsubs = []
}

function scheduleLocalBackup(userId: string): void {
  if (backupTimer) clearTimeout(backupTimer)
  backupTimer = setTimeout(() => {
    writeLocalBackup(userId)
  }, 400)
}

function scheduleAutoSave(): void {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    void useAuthStore.getState().syncNow()
  }, 2500)
}

function shouldHydrateFromCloud(event: AuthChangeEvent): boolean {
  return event === 'SIGNED_IN'
}

async function runInitialSync(userId: string, options?: { force?: boolean }): Promise<void> {
  if (!options?.force && hydratedUserId === userId && useAuthStore.getState().dataReady) {
    return
  }

  if (syncInFlight && syncInFlightUserId === userId) {
    return syncInFlight
  }

  syncInFlightUserId = userId
  syncInFlight = (async () => {
    const { setSyncStatus } = useAuthStore.getState()
    const alreadyReady = useAuthStore.getState().dataReady && hydratedUserId === userId
    if (!alreadyReady) {
      setSyncStatus('syncing')
      useAuthStore.setState({ dataReady: false })
    }
    try {
      const updatedAt = await loadUserDataFromCloud(userId)
      hydratedUserId = userId
      writeLocalBackup(userId)
      useAuthStore.setState({
        dataReady: true,
        syncStatus: 'synced',
        lastSyncedAt: updatedAt,
        syncError: null,
        saveError: null,
      })
    } catch (e) {
      const raw = e instanceof Error ? e.message : 'Could not load practice data'
      if (import.meta.env.DEV) console.error('[sync load]', raw)
      const message = mapSyncError(raw)
      const backup = readLocalBackup(userId)
      if (backup) {
        hydrateAppSnapshot(backup)
        hydratedUserId = userId
        useAuthStore.setState({
          dataReady: true,
          syncStatus: 'synced',
          syncError: null,
          saveError: message,
        })
        void useAuthStore.getState().flushPendingSave()
        return
      }
      resetAllStores()
      useAuthStore.setState({ dataReady: false, syncStatus: 'error', syncError: message })
    }
  })()

  try {
    await syncInFlight
  } finally {
    if (syncInFlightUserId === userId) {
      syncInFlight = null
      syncInFlightUserId = null
    }
  }
}

function handleSignedInUser(userId: string, event: AuthChangeEvent | 'initial'): void {
  deferAuthSideEffect(() => {
    const shouldLoad = event === 'initial' || shouldHydrateFromCloud(event as AuthChangeEvent)
    if (!shouldLoad) return
    void runInitialSync(userId).then(() => {
      if (useAuthStore.getState().dataReady) {
        startAutoSave(userId)
      }
    })
  })
}

function startAutoSave(userId: string): void {
  clearAutoSave()
  for (const store of SYNC_STORES) {
    storeUnsubs.push(
      store.subscribe(() => {
        const { user, dataReady } = useAuthStore.getState()
        if (user?.id === userId && dataReady) {
          scheduleLocalBackup(userId)
          scheduleAutoSave()
        }
      }),
    )
  }
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  session: null,
  user: null,
  loading: true,
  dataReady: false,
  syncStatus: 'offline',
  lastSyncedAt: null,
  syncError: null,
  saveError: null,

  setSyncStatus: (syncStatus, syncError = null) => set({ syncStatus, syncError }),

  initialize: () => {
    void supabase.auth.getSession().then(({ data: { session } }) => {
      const prevUserId = get().user?.id ?? null
      const nextUserId = session?.user?.id ?? null
      if (prevUserId && prevUserId !== nextUserId) {
        resetAllStores()
        hydratedUserId = null
      }

      set({ session, user: session?.user ?? null, loading: false })
      if (session?.user) {
        handleSignedInUser(session.user.id, 'initial')
      } else if (!nextUserId && !prevUserId) {
        resetAllStores()
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const prevUserId = get().user?.id ?? null
      const nextUserId = session?.user?.id ?? null

      set({ session, user: session?.user ?? null, loading: false })

      if (session?.user) {
        if (prevUserId && prevUserId !== nextUserId) {
          resetAllStores()
          hydratedUserId = null
        }
        if (event === 'INITIAL_SESSION') return
        if (shouldHydrateFromCloud(event)) {
          handleSignedInUser(session.user.id, event)
        }
      } else {
        clearAutoSave()
        clearLocalBackup()
        resetAllStores()
        hydratedUserId = null
        set({
          dataReady: false,
          syncStatus: 'offline',
          lastSyncedAt: null,
          syncError: null,
          saveError: null,
        })
      }
    })

    return () => {
      subscription.unsubscribe()
      clearAutoSave()
    }
  },

  signIn: async (email, password) => {
    set({ syncError: null, saveError: null })
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      const message = mapAuthErr(error)
      set({ syncStatus: 'error', syncError: message })
      throw new Error(message)
    }
    set({ syncStatus: 'syncing', dataReady: false })
  },

  signUp: async (email, password) => {
    set({ syncError: null, saveError: null })
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) {
      const message = mapAuthErr(error)
      set({ syncStatus: 'error', syncError: message })
      throw new Error(message)
    }
    if (data.user && data.user.identities?.length === 0) {
      set({ syncStatus: 'offline' })
      throw new Error(AUTH_ACCOUNT_EXISTS)
    }
    if (!data.session) {
      set({ syncStatus: 'offline' })
      throw new Error(AUTH_CONFIRM_EMAIL)
    }
    set({ syncStatus: 'syncing', dataReady: false })
  },

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    })
    if (error) {
      const message = mapAuthErr(error)
      set({ syncError: message })
      throw new Error(message)
    }
  },

  signOut: async () => {
    await get().flushPendingSave()
    clearAutoSave()
    clearLocalBackup()
    resetAllStores()
    hydratedUserId = null
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    set({
      dataReady: false,
      syncStatus: 'offline',
      lastSyncedAt: null,
      syncError: null,
      saveError: null,
    })
  },

  syncNow: async () => {
    const userId = get().user?.id
    if (!userId || !get().dataReady) return
    if (saveInFlight) return saveInFlight

    saveInFlight = (async () => {
      try {
        const updatedAt = await pushLocalSnapshot(userId)
        writeLocalBackup(userId)
        set({ syncStatus: 'synced', lastSyncedAt: updatedAt, saveError: null })
      } catch (e) {
        const raw = e instanceof Error ? e.message : 'Save failed'
        if (import.meta.env.DEV) console.error('[sync save]', raw)
        const message = mapSaveError(raw)
        writeLocalBackup(userId)
        set({ saveError: message })
      }
    })()

    try {
      await saveInFlight
    } finally {
      saveInFlight = null
    }
  },

  flushPendingSave: async () => {
    if (saveTimer) {
      clearTimeout(saveTimer)
      saveTimer = null
    }
    const userId = get().user?.id
    if (userId) writeLocalBackup(userId)
    await get().syncNow()
  },

  reloadFromCloud: async () => {
    const userId = get().user?.id
    if (!userId) return
    await get().flushPendingSave()
    hydratedUserId = null
    await runInitialSync(userId, { force: true })
    if (useAuthStore.getState().dataReady) {
      startAutoSave(userId)
    }
  },
}))

export function isDatabaseConnected(): boolean {
  const { user, dataReady, syncStatus } = useAuthStore.getState()
  return Boolean(user && dataReady && syncStatus !== 'error')
}
