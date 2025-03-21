    "use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

type Node = {
  id: string
  label: string
  value: number
  type: "source" | "organization" | "destination" | "fee"
}

type Connection = {
  from: string
  to: string
  value: number
  label: string
}

export function DonationBreakdown() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [hoveredConnection, setHoveredConnection] = useState<string | null>(null)

  const nodes: Node[] = [
    { id: "you", label: "Your Donation", value: 250, type: "source" },
    { id: "others", label: "Other Donors", value: 1250, type: "source" },
    { id: "org", label: "Organization", value: 500, type: "organization" },
    { id: "fees", label: "Admin Fees", value: 150, type: "fee" },
    { id: "direct", label: "Direct Aid", value: 1200, type: "destination" },
    { id: "education", label: "Education", value: 400, type: "destination" },
    { id: "healthcare", label: "Healthcare", value: 250, type: "destination" },
  ]

  const connections: Connection[] = [
    { from: "you", to: "org", value: 250, label: "Your Donation" },
    { from: "others", to: "org", value: 1250, label: "Other Donations" },
    { from: "org", to: "fees", value: 150, label: "Administrative Fees" },
    { from: "org", to: "direct", value: 1200, label: "Direct Aid" },
    { from: "org", to: "education", value: 400, label: "Educational Programs" },
    { from: "org", to: "healthcare", value: 250, label: "Healthcare Support" },
  ]

  const getNodeColor = (type: string, isHovered: boolean) => {
    const baseColors = {
      source: "#0ea5e9",
      organization: "#8b5cf6",
      destination: "#10b981",
      fee: "#f43f5e",
    }

    const hoverColors = {
      source: "#38bdf8",
      organization: "#a78bfa",
      destination: "#34d399",
      fee: "#fb7185",
    }

    return isHovered ? hoverColors[type as keyof typeof hoverColors] : baseColors[type as keyof typeof baseColors]
  }

  const isNodeHighlighted = (nodeId: string) => {
    if (hoveredNode === nodeId) return true
    if (hoveredConnection) {
      const connection = connections.find((c) => `${c.from}-${c.to}` === hoveredConnection)
      if (connection && (connection.from === nodeId || connection.to === nodeId)) return true
    }
    return false
  }

  const isConnectionHighlighted = (connectionId: string) => {
    if (hoveredConnection === connectionId) return true
    if (hoveredNode) {
      const [from, to] = connectionId.split("-")
      if (from === hoveredNode || to === hoveredNode) return true
    }
    return false
  }

  return (
    <section id="donation-breakdown">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Donation Flow</CardTitle>
          <CardDescription className="text-gray-400">See how funds flow from donors to beneficiaries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] w-full relative">
            {/* Draw connections first so they appear behind nodes */}
            <svg className="w-full h-full absolute top-0 left-0">
              {connections.map((connection) => {
                const fromNode = nodes.find((n) => n.id === connection.from)
                const toNode = nodes.find((n) => n.id === connection.to)

                if (!fromNode || !toNode) return null

                // Calculate positions based on node types
                let fromX, fromY, toX, toY

                // Sources on left
                if (fromNode.type === "source") {
                  fromX = 100
                  fromY = fromNode.id === "you" ? 150 : 350
                }

                // Organization in middle
                if (fromNode.type === "organization") {
                  fromX = 400
                  fromY = 250
                }

                // Organization in middle
                if (toNode.type === "organization") {
                  toX = 400
                  toY = 250
                }

                // Fee at top middle
                if (toNode.type === "fee") {
                  toX = 400
                  toY = 80
                }

                // Destinations on right
                if (toNode.type === "destination") {
                  toX = 700
                  if (toNode.id === "direct") toY = 150
                  if (toNode.id === "education") toY = 250
                  if (toNode.id === "healthcare") toY = 350
                }

                const connectionId = `${connection.from}-${connection.to}`
                const isHighlighted = isConnectionHighlighted(connectionId)
                const strokeWidth = isHighlighted ? 6 : 3
                const opacity = hoveredNode || hoveredConnection ? (isHighlighted ? 1 : 0.3) : 0.8

                // Calculate control points for curved lines
                const midX = (fromX! + toX!) / 2
                const midY = (fromY! + toY!) / 2

                // Adjust control points based on connection type
                let controlPoint1X = midX
                let controlPoint1Y = midY
                let controlPoint2X = midX
                let controlPoint2Y = midY

                // Make curves more pronounced for certain connections
                if (fromNode.type === "source" && toNode.type === "organization") {
                  controlPoint1X = midX - 50
                  controlPoint2X = midX - 50
                }

                if (fromNode.type === "organization" && toNode.type === "destination") {
                  controlPoint1X = midX + 50
                  controlPoint2X = midX + 50
                }

                if (fromNode.type === "organization" && toNode.type === "fee") {
                  controlPoint1Y = midY - 50
                  controlPoint2Y = midY - 50
                }

                return (
                  <g key={connectionId}>
                    <path
                      d={`M ${fromX} ${fromY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${toX} ${toY}`}
                      stroke={getNodeColor(toNode.type, isHighlighted)}
                      strokeWidth={strokeWidth}
                      fill="none"
                      opacity={opacity}
                      strokeLinecap="round"
                      onMouseEnter={() => setHoveredConnection(connectionId)}
                      onMouseLeave={() => setHoveredConnection(null)}
                    />

                    {/* Flow amount label */}
                    <text
                      x={midX}
                      y={midY - 10}
                      textAnchor="middle"
                      fill={isHighlighted ? "#ffffff" : "#94a3b8"}
                      fontSize={isHighlighted ? "14" : "12"}
                      fontWeight={isHighlighted ? "bold" : "normal"}
                      opacity={opacity}
                    >
                      ${connection.value}
                    </text>
                  </g>
                )
              })}
            </svg>

            {/* Draw nodes on top of connections */}
            <svg className="w-full h-full absolute top-0 left-0 pointer-events-none">
              {nodes.map((node) => {
                let x, y

                // Sources on left
                if (node.type === "source") {
                  x = 100
                  y = node.id === "you" ? 150 : 350
                }

                // Organization in middle
                if (node.type === "organization") {
                  x = 400
                  y = 250
                }

                // Fee at top middle
                if (node.type === "fee") {
                  x = 400
                  y = 80
                }

                // Destinations on right
                if (node.type === "destination") {
                  x = 700
                  if (node.id === "direct") y = 150
                  if (node.id === "education") y = 250
                  if (node.id === "healthcare") y = 350
                }

                const isHighlighted = isNodeHighlighted(node.id)
                const radius = isHighlighted ? 45 : 40
                const opacity = hoveredNode || hoveredConnection ? (isHighlighted ? 1 : 0.5) : 1

                return (
                  <g
                    key={node.id}
                    opacity={opacity}
                    className="pointer-events-auto"
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    {/* Node circle */}
                    <circle
                      cx={x}
                      cy={y}
                      r={radius}
                      fill={getNodeColor(node.type, isHighlighted)}
                      stroke={isHighlighted ? "#ffffff" : "transparent"}
                      strokeWidth={2}
                    />

                    {/* Node label */}
                    <text
                      x={x}
                      y={y}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="14"
                      fontWeight={isHighlighted ? "bold" : "normal"}
                    >
                      {node.label}
                    </text>

                    {/* Node value */}
                    <text x={x} y={y?y:0 + 20} textAnchor="middle" fill="#ffffff" fontSize="12">
                      {node.type !== "organization" ? `$${node.value}` : ""}
                    </text>
                  </g>
                )
              })}
            </svg>

            {/* Legend */}
            <div className="absolute bottom-0 left-0 p-4 bg-gray-900 bg-opacity-80 rounded-md">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#0ea5e9] mr-2"></div>
                  <span className="text-xs text-gray-300">Donors</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#8b5cf6] mr-2"></div>
                  <span className="text-xs text-gray-300">Organization</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#10b981] mr-2"></div>
                  <span className="text-xs text-gray-300">Beneficiaries</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#f43f5e] mr-2"></div>
                  <span className="text-xs text-gray-300">Fees</span>
                </div>
              </div>
            </div>

            {/* Info box for hovered elements */}
            {(hoveredNode || hoveredConnection) && (
              <div className="absolute top-4 right-4 p-4 bg-gray-800 rounded-md shadow-lg border border-gray-700 max-w-xs">
                {hoveredNode && (
                  <>
                    <h4 className="font-medium text-white mb-1">{nodes.find((n) => n.id === hoveredNode)?.label}</h4>
                    <p className="text-sm text-gray-300 mb-2">
                      {hoveredNode === "you"
                        ? "Your contribution"
                        : hoveredNode === "others"
                          ? "Contributions from other donors"
                          : hoveredNode === "org"
                            ? "Manages and distributes all funds"
                            : hoveredNode === "fees"
                              ? "Administrative costs"
                              : "Receives funds for direct impact"}
                    </p>
                    {hoveredNode !== "org" && (
                      <p className="text-xs text-gray-400">Amount: ${nodes.find((n) => n.id === hoveredNode)?.value}</p>
                    )}
                  </>
                )}

                {hoveredConnection && !hoveredNode && (
                  <>
                    <h4 className="font-medium text-white mb-1">
                      {connections.find((c) => `${c.from}-${c.to}` === hoveredConnection)?.label}
                    </h4>
                    <p className="text-sm text-gray-300 mb-2">
                      Flow amount: ${connections.find((c) => `${c.from}-${c.to}` === hoveredConnection)?.value}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

