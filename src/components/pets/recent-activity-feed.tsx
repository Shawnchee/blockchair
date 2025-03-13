"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, ShoppingCart, Trophy, User } from "lucide-react"

export default function RecentActivityFeed() {
  const [activities, setActivities] = useState([
    {
      id: 1,
      user: "PetLover123",
      action: "donated",
      detail: "100 Karma Shards",
      time: "2 minutes ago",
      icon: <Heart className="h-4 w-4 text-pink-500" />,
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 2,
      user: "KindHeart",
      action: "bought",
      detail: "a new hat for their pet",
      time: "15 minutes ago",
      icon: <ShoppingCart className="h-4 w-4 text-purple-500" />,
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 3,
      user: "GreenEarth",
      action: "completed",
      detail: "the 'Share on Twitter' task",
      time: "30 minutes ago",
      icon: <Trophy className="h-4 w-4 text-yellow-500" />,
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 4,
      user: "WaterGuardian",
      action: "joined",
      detail: "the community",
      time: "1 hour ago",
      icon: <User className="h-4 w-4 text-blue-500" />,
      avatar: "/placeholder.svg?height=32&width=32",
    },
  ])

  // Simulate new activities appearing
  useEffect(() => {
    const interval = setInterval(() => {
      const newActivity = {
        id: Date.now(),
        user: ["PetLover123", "KindHeart", "GreenEarth", "WaterGuardian", "ForestFriend"][
          Math.floor(Math.random() * 5)
        ],
        action: ["donated", "bought", "completed", "joined", "earned"][Math.floor(Math.random() * 5)],
        detail: ["50 Karma Shards", "a new accessory", "the 'Invite a Friend' task", "the community", "100 XP"][
          Math.floor(Math.random() * 5)
        ],
        time: "just now",
        icon: [
          <Heart key="heart" className="h-4 w-4 text-pink-500" />,
          <ShoppingCart key="cart" className="h-4 w-4 text-purple-500" />,
          <Trophy key="trophy" className="h-4 w-4 text-yellow-500" />,
          <User key="user" className="h-4 w-4 text-blue-500" />,
        ][Math.floor(Math.random() * 4)],
        avatar: "/placeholder.svg?height=32&width=32",
      }

      setActivities((prev) => [newActivity, ...prev.slice(0, 9)])
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-3 border-b pb-3 last:border-0">
              <Avatar className="h-8 w-8">
                <AvatarImage src={activity.avatar} alt={activity.user} />
                <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <div className="flex items-center gap-1">
                  <span className="font-medium">{activity.user}</span>
                  <span className="text-muted-foreground">{activity.action}</span>
                  <span>{activity.detail}</span>
                </div>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
              <div className="flex-shrink-0">{activity.icon}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

