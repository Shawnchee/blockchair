"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Utensils, Shirt, Edit, BarChart3 } from "lucide-react"
import PetStats from "@/components/pets/pet-stats"
import PetActivityLog from "@/components/pets/pet-activity-log"
import { useUserData } from "@/hooks/fetchUserData"

export default function PetPage() {
  const [petName, setPetName] = useState("Fluffy")
  const [background, setBackground] = useState("forest")
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(petName)
  // test pull
  const user = useUserData("da0bedc0-b399-4c8d-8d5b-28c70224f7e4")

  const backgrounds = {
    forest: "bg-gradient-to-b from-green-100 to-blue-100",
    beach: "bg-gradient-to-b from-blue-100 to-yellow-100",
    city: "bg-gradient-to-b from-gray-100 to-purple-100",
  }

  const handleRename = () => {
    if (isRenaming) {
      setPetName(newName)
    }
    setIsRenaming(!isRenaming)
  }

  const handleBackgroundChange = (bg: string) => {
    setBackground(bg)
  }

  // test image rendering
  const getPet = (path: string) => {
    const bucket = 'virtual-pets'
    const folder = 'pet-combined'
    return `https://jalcuslxbhoxepybolxw.supabase.co/storage/v1/object/public/${bucket}/${folder}/${path}`;
  }

  // set real-time subscription

  console.log("asdas", getPet(user?.pet_owned))

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12 ml-auto mr-auto">

      <div className="grid gap-6 lg:grid-cols-[1fr_300px] lg:gap-12">
        {/* Pet Display Area */}
        <div className="flex flex-col items-center">
          <div
            className={`relative w-full h-[400px] rounded-xl overflow-hidden ${backgrounds[background as keyof typeof backgrounds]} flex items-center justify-center mb-6`}
          >
            <div className="relative w-[200px] h-[200px] cursor-pointer transform transition-transform hover:scale-110 active:scale-95">
              <Image
                src={getPet(user?.pet_owned)}
                alt={petName}
                width={200}
                height={200}
                className="object-contain"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            {isRenaming ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                  autoFocus
                />
                <Button onClick={handleRename} size="sm">
                  Save
                </Button>
              </div>
            ) : (
              <h1 className="text-3xl font-bold text-purple-700">{petName}</h1>
            )}
            <Button variant="ghost" size="icon" onClick={handleRename}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Utensils className="mr-2 h-4 w-4" /> Feed Pet
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Shirt className="mr-2 h-4 w-4" /> Change Outfit
            </Button>
            <Button variant="outline" onClick={() => setIsRenaming(true)}>
              <Edit className="mr-2 h-4 w-4" /> Rename Pet
            </Button>
            <Button variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" /> View Stats
            </Button>
          </div>

          <div className="mt-8 w-full">
            <h2 className="text-xl font-bold mb-4 text-purple-700">Background</h2>
            <div className="grid grid-cols-3 gap-4">
              <Button
                variant={background === "forest" ? "default" : "outline"}
                onClick={() => handleBackgroundChange("forest")}
                className={background === "forest" ? "bg-green-600 hover:bg-green-700" : ""}
              >
                Forest
              </Button>
              <Button
                variant={background === "beach" ? "default" : "outline"}
                onClick={() => handleBackgroundChange("beach")}
                className={background === "beach" ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                Beach
              </Button>
              <Button
                variant={background === "city" ? "default" : "outline"}
                onClick={() => handleBackgroundChange("city")}
                className={background === "city" ? "bg-purple-600 hover:bg-purple-700" : ""}
              >
                City
              </Button>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4 text-purple-700">Pet Stats</h2>
              <PetStats />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4 text-purple-700">Recent Activity</h2>
              <PetActivityLog />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

