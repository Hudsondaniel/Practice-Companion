import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { mapSaveError, mapSyncError } from '@/lib/errors'
import {
  AUTH_ACCOUNT_EXISTS,
  AUTH_CONFIRM_EMAIL,
  mapAuthError as mapAuthErr,
} from '@/lib/auth-errors'
import { supabase } from '@/lib/supabase'
import { loadUserDataFromCloud, pushLocalSnapshot } from '@/lib/supabase-sync/repository'
import { resetAllStores } from '@/lib/supabase-sync/snapshot'
import { useAdherenceStore } from '@/stores/adherence-store'
import { useGuidedSessionStore } from '@/stores/guided-session-store'
import { usePracticeStore } from '@/stores/practice-store'
import { useSessionToolsStore } from '@/stores/session-tools-store'
import { useStreakStore } from '@/stores/streak-store'
import { useTranscriptionStore } from '@/stores/transcription-store'
import { useVocabularyStore } from '@/stores/vocabulary-store'

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

  initialize: () => () => void
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  syncNow: () => Promise<void>
  reloadFromCloud: () => Promise<void>
  setSyncStatus: (status: SyncStatus, error?: string | null) => void
}

let saveTimer: ReturnType<typeof setTimeout> | null = null
let storeUnsubs: (() => void)[] = []
let syncInFlight: Promise<void> | null = null
let syncInFlightUserId: string | null = null

function deferAuthSideEffect(fn: () => void): void {
  // Supabase auth deadlocks if you call the client from inside onAuthStateChange synchronously.
  queueMicrotask(fn)
}

const SYNC_STORES = [
  usePracticeStore,
  useTranscriptionStore,
  useVocabularyStore,
  useAdherenceStore,
  useStreakStore,
  useSessionToolsStore,
  useGuidedSessionStore,
] as const

function clearAutoSave(): void {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = null
  for (const unsub of storeUnsubs) unsub()
  storeUnsubs = []
}

function scheduleAutoSave(): void {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    void useAuthStore.getState().syncNow()
  }, 2500)
}

async function runInitialSync(userId: string): Promise<void> {
  if (syncInFlight && syncInFlightUserId === userId) {
    return syncInFlight
  }

  syncInFlightUserId = userId
  syncInFlight = (async () => {
    const { setSyncStatus } = useAuthStore.getState()
    setSyncStatus('syncing')
    useAuthStore.setState({ dataReady: false })
    try {
      const updatedAt = await loadUserDataFromCloud(userId)
      useAuthStore.setState({
        dataReady: true,
        syncStatus: 'synced',
        lastSyncedAt: updatedAt,
        syncError: null,
      })
    } catch (e) {
      resetAllStores()
      const raw = e instanceof Error ? e.message : 'Could not load practice data'
      if (import.meta.env.DEV) console.error('[sync load]', raw)
      const message = mapSyncError(raw)
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

function handleSignedInUser(userId: string): void {
  deferAuthSideEffect(() => {
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

  setSyncStatus: (syncStatus, syncError = null) => set({ syncStatus, syncError }),

  initialize: () => {
    resetAllStores()

    void supabase.auth.getSession().then(({ data: { session } }) => {
      set({ session, user: session?.user ?? null, loading: false })
      if (session?.user) {
        handleSignedInUser(session.user.id)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      set({ session, user: session?.user ?? null, loading: false })

      if (session?.user) {
        // INITIAL_SESSION is handled by getSession above — avoid double sync on load.
        if (event !== 'INITIAL_SESSION') {
          handleSignedInUser(session.user.id)
        }
      } else {
        clearAutoSave()
        resetAllStores()
        set({
          dataReady: false,
          syncStatus: 'offline',
          lastSyncedAt: null,
          syncError: null,
        })
      }
    })

    return () => {
      subscription.unsubscribe()
      clearAutoSave()
    }
  },

  signIn: async (email, password) => {
    set({ syncError: null })
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      const message = mapAuthErr(error)
      set({ syncStatus: 'error', syncError: message })
      throw new Error(message)
    }
    set({ syncStatus: 'syncing', dataReady: false })
  },

  signUp: async (email, password) => {
    set({ syncError: null })
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
    // Supabase returns empty identities when email already exists (anti-enumeration).
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
    clearAutoSave()
    resetAllStores()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    set({
      dataReady: false,
      syncStatus: 'offline',
      lastSyncedAt: null,
      syncError: null,
    })
  },

  syncNow: async () => {
    const userId = get().user?.id
    if (!userId || !get().dataReady) return
    set({ syncStatus: 'syncing', syncError: null })
    try {
      const updatedAt = await pushLocalSnapshot(userId)
      set({ syncStatus: 'synced', lastSyncedAt: updatedAt, syncError: null })
    } catch (e) {
      const raw = e instanceof Error ? e.message : 'Save failed'
      if (import.meta.env.DEV) console.error('[sync save]', raw)
      const message = mapSaveError(raw)
      set({ syncStatus: 'error', syncError: message })
    }
  },

  reloadFromCloud: async () => {
    const userId = get().user?.id
    if (!userId) return
    await runInitialSync(userId)
    if (useAuthStore.getState().dataReady) {
      startAutoSave(userId)
    }
  },
}))

export function isDatabaseConnected(): boolean {
  const { user, dataReady, syncStatus } = useAuthStore.getState()
  return Boolean(user && dataReady && syncStatus !== 'error')
}
