'use client'

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { OrderView } from '@inventory/domain'

export function SumsChart({ orders }: { orders: OrderView[] }) {
  const data = orders.map((order) => ({
    name: order.title.length > 22 ? `${order.title.slice(0, 22)}…` : order.title,
    uah: order.totalUah,
    usd: order.totalUsd,
  }))
  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} hide={data.length > 6} />
          <YAxis width={64} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="uah" fill="#8bc346" radius={[4, 4, 0, 0]} />
          <Bar dataKey="usd" fill="#4a5963" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
