"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Shirt, Apple, Crown, ImageIcon, ShoppingCart } from "lucide-react"

// Mock marketplace data
const marketplaceItems = {
  food: [
    {
      id: 1,
      name: "Premium Apple",
      description: "Increases happiness by 15",
      price: 50,
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 2,
      name: "Golden Carrot",
      description: "Increases happiness by 10",
      price: 30,
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 3,
      name: "Birthday Cake",
      description: "Increases happiness by 30",
      price: 100,
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 4,
      name: "Ice Cream",
      description: "Increases happiness by 20",
      price: 75,
      image: "/placeholder.svg?height=80&width=80",
    },
  ],
  clothing: [
    {
      id: 5,
      name: "Superhero Cape",
      description: "A magical cape",
      price: 200,
      image: "/placeholder.svg?height=80&width=80",
    },
    { id: 6, name: "Winter Hat", description: "A cozy hat", price: 150, image: "/placeholder.svg?height=80&width=80" },
    {
      id: 7,
      name: "Summer Dress",
      description: "A pretty dress",
      price: 250,
      image: "/placeholder.svg?height=80&width=80",
    },
  ],
  accessories: [
    {
      id: 8,
      name: "Sunglasses",
      description: "Cool sunglasses",
      price: 100,
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 9,
      name: "Gold Necklace",
      description: "A fancy necklace",
      price: 300,
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 10,
      name: "Magic Wand",
      description: "A mystical wand",
      price: 350,
      image: "/placeholder.svg?height=80&width=80",
    },
  ],
  backgrounds: [
    {
      id: 11,
      name: "Enchanted Forest",
      description: "A magical forest",
      price: 400,
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 12,
      name: "Tropical Beach",
      description: "A paradise beach",
      price: 400,
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 13,
      name: "Night City",
      description: "A city at night",
      price: 400,
      image: "/placeholder.svg?height=80&width=80",
    },
  ],
}

export default function MarketplacePage() {
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)
  const [karmaShards, setKarmaShards] = useState(500)

  const handleItemClick = (item: any) => {
    setSelectedItem(item)
  }

  const handlePurchase = () => {
    if (selectedItem && karmaShards >= selectedItem.price) {
      setKarmaShards(karmaShards - selectedItem.price)
      // Logic to add item to inventory would go here
      alert(`Successfully purchased ${selectedItem.name}!`)
      setShowPurchaseDialog(false)
    } else {
      alert("Not enough Karma Shards!")
    }
  }

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-purple-700">Marketplace</h1>
        <div className="flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full">
          <ShoppingCart className="h-5 w-5 text-purple-700" />
          <span className="font-bold text-purple-700">{karmaShards} Karma Shards</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px] lg:gap-12">
        <Tabs defaultValue="food" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6 w-full">
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
              {marketplaceItems.food.map((item) => (
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
                    <Badge variant="outline" className="mt-2 bg-purple-100 text-purple-700">
                      {item.price} Shards
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="clothing" className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {marketplaceItems.clothing.map((item) => (
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
                    <Badge variant="outline" className="mt-2 bg-purple-100 text-purple-700">
                      {item.price} Shards
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="accessories" className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {marketplaceItems.accessories.map((item) => (
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
                    <Badge variant="outline" className="mt-2 bg-purple-100 text-purple-700">
                      {item.price} Shards
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="backgrounds" className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {marketplaceItems.backgrounds.map((item) => (
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
                    <Badge variant="outline" className="mt-2 bg-purple-100 text-purple-700">
                      {item.price} Shards
                    </Badge>
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
                    <p className="font-bold text-purple-700 mt-2">{selectedItem.price} Karma Shards</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowPurchaseDialog(true)}
                      className="w-30 bg-purple-600 hover:bg-purple-700"
                    >
                      Purchase
                    </Button>
                    <Button variant="outline" className="w-30">
                      Preview
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center">Select an item to view details</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              Are you sure you want to buy {selectedItem?.name} for {selectedItem?.price} Karma Shards?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <Image
              src={selectedItem?.image || "/placeholder.svg?height=100&width=100"}
              alt={selectedItem?.name || "Item"}
              width={100}
              height={100}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPurchaseDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePurchase} className="bg-purple-600 hover:bg-purple-700">
              Confirm Purchase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

