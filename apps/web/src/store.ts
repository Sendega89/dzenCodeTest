import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { SessionUser, Snapshot } from '@inventory/domain'

const inventory = createSlice({
  name: 'inventory',
  initialState: null as unknown as Snapshot,
  reducers: {
    applySnapshot: (state, action: PayloadAction<Snapshot>) => {
      if (!state || action.payload.revision > state.revision) return action.payload
      return state
    },
  },
})

const session = createSlice({
  name: 'session',
  initialState: { user: null as SessionUser | null },
  reducers: {
    setUser: (state, action: PayloadAction<SessionUser | null>) => {
      state.user = action.payload
    },
  },
})

export const { applySnapshot } = inventory.actions
export const { setUser } = session.actions

export function makeStore(snapshot: Snapshot, user: SessionUser | null) {
  return configureStore({
    reducer: { inventory: inventory.reducer, session: session.reducer },
    preloadedState: {
      inventory: snapshot,
      session: { user },
    },
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
