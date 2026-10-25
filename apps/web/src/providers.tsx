'use client'

import { createContext, useContext, useEffect, useRef } from 'react'
import { Provider, useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'
import type { Locale, SessionUser, Snapshot } from '@inventory/domain'
import { messagesFor, type Messages } from '@inventory/ui'
import { applySnapshot, makeStore, setUser, type AppDispatch, type AppStore, type RootState } from './store'

const LocaleContext = createContext<{ locale: Locale; messages: Messages }>({
  locale: 'ru',
  messages: messagesFor('ru'),
})

export function useI18n() {
  return useContext(LocaleContext)
}

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export function AppProviders({
  snapshot,
  user,
  locale,
  children,
}: {
  snapshot?: Snapshot
  user?: SessionUser | null
  locale: Locale
  children: React.ReactNode
}) {
  const storeRef = useRef<AppStore | null>(null)
  if (snapshot && !storeRef.current) storeRef.current = makeStore(snapshot, user ?? null)

  useEffect(() => {
    if (!snapshot || !storeRef.current) return
    storeRef.current.dispatch(applySnapshot(snapshot))
    storeRef.current.dispatch(setUser(user ?? null))
  }, [snapshot, user])

  const body = <LocaleContext.Provider value={{ locale, messages: messagesFor(locale) }}>{children}</LocaleContext.Provider>
  if (!storeRef.current) return body
  return <Provider store={storeRef.current}>{body}</Provider>
}
