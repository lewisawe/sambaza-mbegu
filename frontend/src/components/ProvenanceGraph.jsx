import React, { useMemo, useCallback } from 'react'
import ForceGraph2D from 'react-force-graph-2d'

export default function ProvenanceGraph({ data }) {
  const graphData = useMemo(() => {
    if (!data || !data.length) return { nodes: [], links: [] }

    const nodes = new Map()
    const links = []

    data.forEach(record => {
      if (!record.chain) return
      record.chain.forEach((node, idx) => {
        const id = node.id || node.phone || `node-${idx}`
        if (!nodes.has(id)) {
          nodes.set(id, { id, name: node.name, isRoot: idx === 0, depth: idx })
        }
        if (idx > 0) {
          const sourceId = record.chain[idx - 1].id || record.chain[idx - 1].phone
          const linkId = `${sourceId}-${id}`
          if (!links.find(l => `${l.source}-${l.target}` === linkId)) {
            links.push({ source: sourceId, target: id })
          }
        }
      })
    })

    return { nodes: [...nodes.values()], links }
  }, [data])

  const paintNode = useCallback((node, ctx) => {
    const size = node.isRoot ? 10 : 6
    ctx.beginPath()
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI)
    ctx.fillStyle = node.isRoot ? '#ff4f2b' : '#f5f5f5'
    ctx.fill()

    ctx.font = `${node.isRoot ? '600 ' : '400 '}5px Inter, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillStyle = '#bfbfbf'
    ctx.fillText(node.name || '', node.x, node.y + size + 8)
  }, [])

  if (!graphData.nodes.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="font-[var(--font-chivo-mono)] text-[14px] text-steel-mid">NO PROVENANCE TRAIL FOUND</p>
      </div>
    )
  }

  return (
    <div className="h-full w-full relative">
      <div className="absolute bottom-4 left-4 z-10 bg-void-black border border-graphite-border px-4 py-3 flex gap-4 font-[var(--font-chivo-mono)] text-[11px] text-fog-light">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-ember-orange"></span>
          <span>ORIGIN</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-bone-white"></span>
          <span>RECEIVED</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-ember-orange">→</span>
          <span>SHARED TO</span>
        </div>
      </div>
      <ForceGraph2D
        graphData={graphData}
        nodeCanvasObject={paintNode}
        nodePointerAreaPaint={(node, color, ctx) => {
          ctx.beginPath()
          ctx.arc(node.x, node.y, 12, 0, 2 * Math.PI)
          ctx.fillStyle = color
          ctx.fill()
        }}
        linkDirectionalArrowLength={8}
        linkDirectionalArrowRelPos={0.85}
        linkColor={() => '#3c3c3c'}
        linkWidth={1.5}
        backgroundColor="#1a1a1a"
        d3VelocityDecay={0.3}
        cooldownTicks={60}
      />
    </div>
  )
}
