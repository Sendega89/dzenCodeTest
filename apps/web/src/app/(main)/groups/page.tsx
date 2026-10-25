'use client'

import dynamic from 'next/dynamic'
import { GroupsBoard } from '@inventory/ui'
import { useAppSelector, useI18n } from '@/providers'

const RelationGraph = dynamic(() => import('@/graph').then((mod) => mod.RelationGraph), { ssr: false })

export default function GroupsPage() {
  const { messages } = useI18n()
  const snapshot = useAppSelector((state) => state.inventory)
  return (
    <>
      <GroupsBoard messages={messages} groups={snapshot.groups} />
      <section className="graph-card">
        <h2>{messages.groups.graph}</h2>
        <div className="graph-card__canvas">
          <RelationGraph orders={snapshot.orders} products={snapshot.products} />
        </div>
      </section>
    </>
  )
}
