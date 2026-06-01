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
          nodes.set(id, {
            id,
            name: node.name,
            isRoot: idx === 0,
            depth: idx,
          })
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
    const size = node.isRoot ? 10 : 7
    ctx.beginPath()
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI)
    ctx.fillStyle = node.isRoot ? '#92400e' : '#d97706'
    ctx.fill()
    ctx.strokeStyle = '#fef3c7'
    ctx.lineWidth = 2.5
    ctx.stroke()

    ctx.font = `${node.isRoot ? 'bold ' : ''}5px "DM Sans", sans-serif`
    ctx.textAlign = 'center'
    ctx.fillStyle = '#1c1917'
    ctx.fillText(node.name || '', node.x, node.y + size + 8)
  }, [])

  if (!graphData.nodes.length) {
    return (
      <div className="provenance-empty">
        <p>No provenance trail found for this variety</p>
      </div>
    )
  }

  return (
    <div className="provenance-graph">
      <div className="provenance-graph__legend">
        <div className="legend-item">
          <span className="legend-dot legend-dot--root"></span>
          <span>Origin farmer</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot legend-dot--node"></span>
          <span>Received seed</span>
        </div>
        <div className="legend-item">
          <span className="legend-arrow">→</span>
          <span>Shared to</span>
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
        linkColor={() => '#d97706'}
        linkWidth={2}
        linkLineDash={[4, 2]}
        d3VelocityDecay={0.3}
        cooldownTicks={60}
      />
    </div>
  )
}
