"use client"

import { useState, useEffect } from "react"
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
import supabase from "@/utils/supabase/client";
import { useUserData } from "@/hooks/fetchUserData"
import getCurrentUser from "@/hooks/getCurrentUser"


// Mock marketplace data
const fetchMarketplaceItems = async () => {
    const { data, error } = await supabase.from('items').select('*')
    if (error) {
      console.error("Error fetching marketplace items:", error)
      return {}
    }
    return data.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = []
      }
      acc[item.type].push(item)
      return acc
    }, {})
  } 

  interface Item {
    id: string,
    name: string,
    type: string,
    price: number,
    image_url: string,
    description: string,
  }

  
  
  
export default function MarketplacePage() {
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)
  const [karmaShards, setKarmaShards] = useState(0);
  const [marketplaceItems, setMarketplaceItems] = useState<any>({})
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
      setKarmaShards(user.coins)
      // setPetName(user.pet_name)
      // setBackground(user.pet_background)
    }
  }, [user])
  

  // Get user id from session
  // TODO - Setup proper user Type
  const dbHandlePurchase = async (user, purchaseItem:Item) => {
    const { data, error } = await supabase
      .from("users")
      .update({ coins: karmaShards - purchaseItem.price })
      .eq('email',user.email)

    const { data:userItemData, error:userItemError } = await supabase.from("user_items").insert([
      { user_id: user.id, item_id: purchaseItem.id,purchased_at: new Date(),selected: false }
    ])
    if (error) {
      console.error(error)
      return
    }
    if (userItemError) {
      console.error(userItemError)
      return
    }
    console.log("Updated user data")
    console.log(data)
  }
  
  

  useEffect(() => {
    fetchMarketplaceItems().then(setMarketplaceItems)
  }, [])

  const handleItemClick = (item: Item) => {
    setSelectedItem(item)
  }

  const handlePurchase = () => {
    if (selectedItem && karmaShards >= selectedItem.price) {
      setKarmaShards(karmaShards - selectedItem.price)
      // Logic to add item to inventory would go here
      dbHandlePurchase(user,selectedItem).then(() => {
        alert(`Successfully purchased ${selectedItem.name}!`)
        setShowPurchaseDialog(false)
      }
      )
    } else {
      alert("Not enough Karma Shards!")
    }
  }

  const getImageUrl = (path: string) => {
    const bucket = 'virtual-pets'
    return `https://jalcuslxbhoxepybolxw.supabase.co/storage/v1/object/public/${bucket}/${path}`;
  }


  return (
    <div className="container px-4 pt-24 pb-8 md:px-6 ">
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
            {<TabsTrigger value="food" className="flex items-center gap-2 cursor-pointer">
              <Apple className="h-4 w-4" /> Food
            </TabsTrigger>}
            <TabsTrigger value="clothing" className="flex items-center gap-2 cursor-pointer">
              <Shirt className="h-4 w-4" /> Clothing
            </TabsTrigger>
            <TabsTrigger value="accessories" className="flex items-center gap-2 cursor-pointer">
              <Crown className="h-4 w-4" /> Accessories
            </TabsTrigger>
            <TabsTrigger value="background" className="flex items-center gap-2 cursor-pointer">
              <ImageIcon className="h-4 w-4" /> Background
            </TabsTrigger>
          </TabsList>

          <TabsContent value="food" className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {marketplaceItems.food && marketplaceItems.food.map((item: Item) => (
                <Card
                  key={item.id}
                  className={`cursor-pointer transition-all ${selectedItem?.id === item.id ? "ring-2 ring-purple-500" : ""}`}
                  onClick={() => handleItemClick(item)}
                >
                  <CardContent className="p-4 flex flex-col items-center">
                    <Image
                      src={getImageUrl(item.image_url) || "/placeholder.svg"}
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
              {marketplaceItems.clothing && marketplaceItems.clothing.map((item: Item) => (
                <Card
                  key={item.id}
                  className={`cursor-pointer transition-all ${selectedItem?.id === item.id ? "ring-2 ring-purple-500" : ""}`}
                  onClick={() => handleItemClick(item)}
                >
                  <CardContent className="p-4 flex flex-col items-center">
                    <Image
                      src={getImageUrl(item.image_url) || "/placeholder.svg"}
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
              {marketplaceItems.accessories && marketplaceItems.accessories.map((item: Item) => (
                <Card
                  key={item.id}
                  className={`cursor-pointer transition-all ${selectedItem?.id === item.id ? "ring-2 ring-purple-500" : ""}`}
                  onClick={() => handleItemClick(item)}
                >
                  <CardContent className="p-4 flex flex-col items-center">
                    <Image
                      src={getImageUrl(item.image_url) || "/placeholder.svg"}
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

          <TabsContent value="background" className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {marketplaceItems.background && marketplaceItems.background.map((item: Item) => (
                <Card
                  key={item.id}
                  className={`cursor-pointer transition-all ${selectedItem?.id === item.id ? "ring-2 ring-purple-500" : ""}`}
                  onClick={() => handleItemClick(item)}
                >
                  <CardContent className="p-4 flex flex-col items-center">
                    <Image
                      src={getImageUrl(item.image_url) || "/placeholder.svg"}
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
                      src={getImageUrl(selectedItem.image_url) || "/placeholder.svg"}
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
              src={getImageUrl(selectedItem?.image_url) || "/placeholder.svg?height=100&width=100"}
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

