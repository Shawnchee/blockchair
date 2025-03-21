"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shirt, Apple, Crown, ImageIcon } from "lucide-react"

// Mock inventory data
const inventoryItems = {
  food: [
    { id: 1, name: "Apple", description: "Increases happiness by 10", image: "/placeholder.svg?height=80&width=80" },
    { id: 2, name: "Carrot", description: "Increases happiness by 5", image: "/placeholder.svg?height=80&width=80" },
    { id: 3, name: "Cake", description: "Increases happiness by 20", image: "/placeholder.svg?height=80&width=80" },
  ],
  clothing: [
    { id: 4, name: "T-Shirt", description: "A casual t-shirt", image: "/placeholder.svg?height=80&width=80" },
    { id: 5, name: "Hat", description: "A stylish hat", image: "/placeholder.svg?height=80&width=80" },
    { id: 6, name: "Scarf", description: "A warm scarf", image: "/placeholder.svg?height=80&width=80" },
  ],
  accessories: [
    { id: 7, name: "Glasses", description: "Stylish glasses", image: "/placeholder.svg?height=80&width=80" },
    { id: 8, name: "Necklace", description: "A shiny necklace", image: "/placeholder.svg?height=80&width=80" },
  ],
  backgrounds: [
    { id: 9, name: "Forest", description: "A peaceful forest", image: "/placeholder.svg?height=80&width=80" },
    { id: 10, name: "Beach", description: "A sunny beach", image: "/placeholder.svg?height=80&width=80" },
    { id: 11, name: "City", description: "A bustling city", image: "/placeholder.svg?height=80&width=80" },
  ],
}

export default function InventoryPage() {
  const [selectedItem, setSelectedItem] = useState<any>(null)

  const handleItemClick = (item: any) => {
    setSelectedItem(item)
  }

  const handleUseItem = () => {
    // Logic to use the item would go here
    alert(`Using ${selectedItem.name}`)
    setSelectedItem(null)
  }

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <h1 className="text-3xl font-bold mb-6 text-purple-700">My Inventory</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px] lg:gap-12">
        <Tabs defaultValue="food" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="food" className="flex items-center gap-2">
              <Apple className="h-4 w-4" /> Food
            </TabsTrigger>
            <TabsTrigger value="clothing" className="flex items-center gap-2">
              <Shirt className="h-4 w-4" /> Clothing
            </TabsTrigger>
            <TabsTrigger value="accessories" className="flex items-center gap-2">
              <Crown className="h-4 w-4" /> Accessories
            </TabsTrigger>
            <TabsTrigger value="backgrounds" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" /> Backgrounds
            </TabsTrigger>
          </TabsList>

          <TabsContent value="food" className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {inventoryItems.food.map((item) => (
                <Card
                  key={item.id}
                  className={`cursor-pointer transition-all ${selectedItem?.id === item.id ? "ring-2 ring-purple-500" : ""}`}
                  onClick={() => handleItemClick(item)}
                >
                  <CardContent className="p-4 flex flex-col items-center">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="mb-2"
                    />
                    <h3 className="font-bold text-center">{item.name}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="clothing" className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {inventoryItems.clothing.map((item) => (
                <Card
                  key={item.id}
                  className={`cursor-pointer transition-all ${selectedItem?.id === item.id ? "ring-2 ring-purple-500" : ""}`}
                  onClick={() => handleItemClick(item)}
                >
                  <CardContent className="p-4 flex flex-col items-center">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="mb-2"
                    />
                    <h3 className="font-bold text-center">{item.name}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="accessories" className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {inventoryItems.accessories.map((item) => (
                <Card
                  key={item.id}
                  className={`cursor-pointer transition-all ${selectedItem?.id === item.id ? "ring-2 ring-purple-500" : ""}`}
                  onClick={() => handleItemClick(item)}
                >
                  <CardContent className="p-4 flex flex-col items-center">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="mb-2"
                    />
                    <h3 className="font-bold text-center">{item.name}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="backgrounds" className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {inventoryItems.backgrounds.map((item) => (
                <Card
                  key={item.id}
                  className={`cursor-pointer transition-all ${selectedItem?.id === item.id ? "ring-2 ring-purple-500" : ""}`}
                  onClick={() => handleItemClick(item)}
                >
                  <CardContent className="p-4 flex flex-col items-center">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="mb-2"
                    />
                    <h3 className="font-bold text-center">{item.name}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4 text-purple-700">Item Details</h2>
              {selectedItem ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Image
                      src={selectedItem.image || "/placeholder.svg"}
                      alt={selectedItem.name}
                      width={120}
                      height={120}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{selectedItem.name}</h3>
                    <p className="text-gray-500">{selectedItem.description}</p>
                  </div>
                  <Button onClick={handleUseItem} className="w-full bg-purple-600 hover:bg-purple-700">
                    Use Item
                  </Button>
                </div>
              ) : (
                <p className="text-gray-500 text-center">Select an item to view details</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

