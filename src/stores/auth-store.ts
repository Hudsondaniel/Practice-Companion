import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { pushLocalSnapshot, syncOnLogin } from '@/lib/supabase-sync/repository'
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
  syncStatus: SyncStatus
  lastSyncedAt: string | null
  syncError: string | null

  initialize: () => () => void
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  syncNow: () => Promise<void>
  setSyncStatus: (status: SyncStatus, error?: string | null) => void
}

let saveTimer: ReturnType<typeof setTimeout> | null = null
let storeUnsubs: (() => void)[] = []

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
  const { setSyncStatus } = useAuthStore.getState()
  setSyncStatus('syncing')
  try {
    await syncOnLogin(userId)
    setSyncStatus('synced')
    useAuthStore.setState({
      lastSyncedAt: new Date().toISOString(),
      syncError: null,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Sync failed'
    setSyncStatus('error', message)
  }
}

function startAutoSave(userId: string): void {
  clearAutoSave()
  for (const store of SYNC_STORES) {
    storeUnsubs.push(
      store.subscribe(() => {
        if (useAuthStore.getState().user?.id === userId) {
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
  syncStatus: 'idle',
  lastSyncedAt: null,
  syncError: null,

  setSyncStatus: (syncStatus, syncError = null) => set({ syncStatus, syncError }),

  initialize: () => {
    void supabase.auth.getSession().then(({ data }) => {
      set({
        session: data.session,
        user: data.session?.user ?? null,
        loading: false,
      })
      if (data.session?.user) {
        void runInitialSync(data.session.user.id)
        startAutoSave(data.session.user.id)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null, loading: false })
      if (session?.user) {
        void runInitialSync(session.user.id)
        startAutoSave(session.user.id)
      } else {
        clearAutoSave()
        set({ syncStatus: 'offline', lastSyncedAt: null, syncError: null })
      }
    })

    return () => {
      subscription.unsubscribe()
      clearAutoSave()
    }
  },

  signIn: async (email, password) => {
    set({ syncStatus: 'syncing', syncError: null })
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      set({ syncStatus: 'error', syncError: error.message })
      throw error
    }
  },

  signUp: async (email, password) => {
    set({ syncStatus: 'syncing', syncError: null })
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      set({ syncStatus: 'error', syncError: error.message })
      throw error
    }
  },

  signOut: async () => {
    clearAutoSave()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    set({ syncStatus: 'offline', lastSyncedAt: null, syncError: null })
  },

  syncNow: async () => {
    const userId = get().user?.id
    if (!userId) return
    set({ syncStatus: 'syncing', syncError: null })
    try {
      const updatedAt = await pushLocalSnapshot(userId)
      set({ syncStatus: 'synced', lastSyncedAt: updatedAt, syncError: null })
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Save failed'
      set({ syncStatus: 'error', syncError: message })
    }
  },
}))
