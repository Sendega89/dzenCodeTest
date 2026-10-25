'use client'

import { routes, type GroupView, type SessionUser, type UserView } from '@inventory/domain'
import type { Messages } from './i18n'
import { Button, EmptyHint, PageHead } from './primitives'

export function GroupsBoard({ messages, groups }: { messages: Messages; groups: GroupView[] }) {
  return (
    <section>
      <PageHead title={messages.groups.title} total={groups.length} messages={messages} />
      {groups.length === 0 ? <EmptyHint>{messages.groups.empty}</EmptyHint> : (
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
      <PageHead title={messages.users.title} total={users.length} messages={messages} />
      {users.length === 0 ? <EmptyHint>{messages.users.empty}</EmptyHint> : (
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
                  <td data-label={messages.users.title}><a href={routes.user(user)}>{user.name}</a></td>
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
      <PageHead title={messages.settings.title} messages={messages} />
      <article className="plain-card stack">
        <h3>{messages.settings.language}</h3>
        <div className="segmented">
          <button type="button" aria-pressed={locale === 'ru'} onClick={() => onLocale('ru')}>{messages.settings.russian}</button>
          <button type="button" aria-pressed={locale === 'en'} onClick={() => onLocale('en')}>{messages.settings.english}</button>
        </div>
        <h3>{messages.settings.session}</h3>
        <p>{user ? `${user.name} · ${user.login}` : messages.dash}</p>
        <p className="hint">{messages.settings.install}</p>
        <Button onClick={onLogout}>{messages.logout}</Button>
      </article>
      <article className="map-card">
        <h2>{messages.settings.map}</h2>
        <p className="hint">{messages.settings.mapText}</p>
        {map}
      </article>
    </section>
  )
}
