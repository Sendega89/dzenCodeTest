'use client'

import ReactFlow, { Background, type Edge, type Node } from 'reactflow'
import 'reactflow/dist/style.css'
import type { OrderView, ProductView } from '@inventory/domain'

export function RelationGraph({ orders, products }: { orders: OrderView[]; products: ProductView[] }) {
  const nodes: Node[] = [
    ...orders.map((order, index) => ({
      id: `order-${order.id}`,
      position: { x: 20, y: index * 78 },
      data: { label: order.title.length > 28 ? `${order.title.slice(0, 28)}…` : order.title },
      style: { width: 220, fontSize: 12 },
    })),
    ...products.map((product, index) => ({
      id: `product-${product.id}`,
      position: { x: 340, y: index * 64 },
      data: { label: product.title.length > 28 ? `${product.title.slice(0, 28)}…` : product.title },
      style: { width: 220, fontSize: 12, borderColor: '#8bc346' },
    })),
  ]
  const edges: Edge[] = products.map((product) => ({
    id: `link-${product.id}`,
    source: `order-${product.orderId}`,
    target: `product-${product.id}`,
  }))
  return <ReactFlow nodes={nodes} edges={edges} fitView nodesDraggable={false} proOptions={{ hideAttribution: true }}><Background /></ReactFlow>
}
