"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Utensils, Shirt, Edit, BarChart3 } from "lucide-react"
import PetStats from "@/components/pets/pet-stats"
import PetActivityLog from "@/components/pets/pet-activity-log"
import getCurrentUser from "@/hooks/getCurrentUser"
import supabase from "@/utils/supabase/client"

export default function PetPage() {
  const [petName, setPetName] = useState("The Magical Panda ✨")
  const [background, setBackground] = useState("space")
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(petName)
  const [user, setUser] = useState(null)

  // Get user data
  // const user = getCurrentUser()
  // console.log(user)

  const sesUser = getCurrentUser()

  useEffect(() => {
    if(sesUser?.email) {
      const fetchUser = async () => {
        const { data, error } = await supabase
          .from("users")
          .select()
          .eq('email',"Somendran737@gmail.com")
          .single()
        if (error) {
          console.error(error)
          return
        }
        console.log("Setting User data")
        console.log(data)
        setUser(data)
      }
      fetchUser()
    }
  }, [sesUser])

  useEffect(() => {
    if (user) {
      console.log("User obj:" + user);
      // setPetName(user.pet_name)
      // setBackground(user.pet_background)
    }
  }, [user])

  const backgrounds = {
    none: "bg-stone-50",
    park: "bg-gradient-to-b from-green-100 to-blue-100",
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

  const getPet = (path: string) => {
    const bucket = 'virtual-pets'
    const folder = 'pet-combined'
    return `https://jalcuslxbhoxepybolxw.supabase.co/storage/v1/object/public/${bucket}/${folder}/${path}`;
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>
          <h1 className="text-3xl font-bold text-center">Loading...</h1>
        </div>
      </div>
    )
  }

  const petImage = user.pet_owned ? getPet(user.pet_owned) : "/placeholder.svg"

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12 ml-auto mr-auto">
      <div className="grid gap-6 lg:grid-cols-[1fr_300px] lg:gap-12">
        {/* Pet Display Area */}
        <div className="flex flex-col items-center">
          <div
            className={`relative w-[800px] h-[400px] rounded-xl overflow-hidden ${backgrounds[background as keyof typeof backgrounds]} flex items-center justify-center mb-6`}
            style={{ backgroundImage: `url(https://jalcuslxbhoxepybolxw.supabase.co/storage/v1/object/public/virtual-pets/background/${background}.png)`, backgroundPosition: '0px -300px' }}
          >
            <div className="relative w-[400px] h-[400px] cursor-pointer transform transition-transform hover:scale-110 active:scale-95">
              <Image
                src={petImage}
                alt={petName}
                width={400}
                height={400}
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

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Utensils className="mr-2 h-4 w-4" /> Feed Pet
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Shirt className="mr-2 h-4 w-4" /> Change Outfit
            </Button>
            <Button variant="outline" onClick={() => setIsRenaming(true)}>
              <Edit className="mr-2 h-4 w-4" /> Rename Pet
            </Button>
            {/* <Button variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" /> View Stats
            </Button> */}
          </div>

          <div className="mt-8 w-full">
            <h2 className="text-xl font-bold mb-4 text-purple-700">Background</h2>
            <div className="grid grid-cols-4 gap-4">
              <Button
                variant={background === "none" ? "default" : "outline"}
                onClick={() => handleBackgroundChange("none")}
                className={background === "none" ? "bg-stone-600 hover:bg-stone-700" : ""}
              >
                None
              </Button>
              <Button
                variant={background === "park" ? "default" : "outline"}
                onClick={() => handleBackgroundChange("park")}
                className={background === "park" ? "bg-green-600 hover:bg-green-700" : ""}
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
              <Button
                variant={background === "space" ? "default" : "outline"}
                onClick={() => handleBackgroundChange("space")}
                className={background === "space" ? "bg-indigo-600 hover:bg-indigo-700" : ""}
              >
                Space
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