'use client'

import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

export function WarehouseMap({ label }: { label: string }) {
  const node = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let map: { remove: () => void } | null = null
    let cancelled = false
    void import('leaflet').then((leaflet) => {
      if (cancelled || !node.current) return
      const instance = leaflet.map(node.current, { scrollWheelZoom: false }).setView([50.4501, 30.5234], 12)
      leaflet
        .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap',
        })
        .addTo(instance)
      const icon = leaflet.divIcon({ className: 'map-pin', iconSize: [18, 18] })
      leaflet.marker([50.4501, 30.5234], { icon }).addTo(instance).bindPopup(label)
      map = instance
      window.setTimeout(() => instance.invalidateSize(), 0)
    })
    return () => {
      cancelled = true
      map?.remove()
    }
  }, [label])

  return <div ref={node} className="map" role="img" aria-label={label} />
}
