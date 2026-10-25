'use client'

import type { GroupView, SessionUser, UserView } from '@inventory/domain'
import type { Messages } from './i18n'

export function GroupsBoard({ messages, groups }: { messages: Messages; groups: GroupView[] }) {
  return (
    <section>
      <div className="page-head"><h1>{messages.groups.title} / {groups.length}</h1></div>
      {groups.length === 0 ? <p className="muted">{messages.groups.empty}</p> : (
        <div className="cards">
          {groups.map((group) => (
            <article key={group.id} className="plain-card">
              <h3>{group.name}</h3>
              <p className="muted">{group.productCount} {messages.groups.products}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export function UsersBoard({ messages, users }: { messages: Messages; users: UserView[] }) {
  return (
    <section>
      <div className="page-head"><h1>{messages.users.title} / {users.length}</h1></div>
      {users.length === 0 ? <p className="muted">{messages.users.empty}</p> : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{messages.users.title}</th>
                <th>{messages.users.login}</th>
                <th>{messages.users.products}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td data-label={messages.users.title}>{user.name}</td>
                  <td data-label={messages.users.login}>{user.login}</td>
                  <td data-label={messages.users.products}>{user.productCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export function SettingsBoard({
  messages,
  user,
  locale,
  onLocale,
  onLogout,
  map,
}: {
  messages: Messages
  user: SessionUser | null
  locale: 'ru' | 'en'
  onLocale: (locale: 'ru' | 'en') => void
  onLogout: () => void
  map: React.ReactNode
}) {
  return (
    <section>
      <div className="page-head"><h1>{messages.settings.title}</h1></div>
      <article className="plain-card stack">
        <h3>{messages.settings.language}</h3>
        <div className="segmented">
          <button type="button" aria-pressed={locale === 'ru'} onClick={() => onLocale('ru')}>{messages.settings.russian}</button>
          <button type="button" aria-pressed={locale === 'en'} onClick={() => onLocale('en')}>{messages.settings.english}</button>
        </div>
        <h3>{messages.settings.session}</h3>
        <p>{user ? `${user.name} · ${user.login}` : messages.dash}</p>
        <p className="hint">{messages.settings.install}</p>
        <button type="button" className="btn" onClick={onLogout}>{messages.logout}</button>
      </article>
      <article className="map-card">
        <h2>{messages.settings.map}</h2>
        <p className="hint">{messages.settings.mapText}</p>
        {map}
      </article>
    </section>
  )
}
