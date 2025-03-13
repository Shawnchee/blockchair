"use client"

import { Progress } from "@/components/ui/progress"

export default function PetStats() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Happiness</span>
          <span className="text-sm font-medium">85%</span>
        </div>
        <Progress value={85} className="h-2 bg-blue-100"/>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Hunger</span>
          <span className="text-sm font-medium">70%</span>
        </div>
        <Progress value={70} className="h-2 bg-orange-100"/>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Energy</span>
          <span className="text-sm font-medium">90%</span>
        </div>
        <Progress value={90} className="h-2 bg-green-100"/>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Experience</span>
          <span className="text-sm font-medium">45%</span>
        </div>
        <Progress value={45} className="h-2 bg-purple-100"/>
      </div>
    </div>
  )
}

