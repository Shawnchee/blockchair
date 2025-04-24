"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Heart } from "lucide-react"
import { Progress } from "@/components/ui/progress"

const MapComponent = ({ 
  validLocations, 
  setHoveredCharity,
  hoveredCharity 
}) => {
  const [customIcon, setCustomIcon] = useState(null)

  useEffect(() => {
    // Initialize Leaflet icons only on client-side
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png"
    })

    // Create custom marker icon
    setCustomIcon(new L.Icon({
      iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230d9488' width='36px' height='36px'%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E",
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36]
    }))
  }, [])

  if (!customIcon) return null // Only render map when icon is ready

  return (
    <MapContainer
      center={[20, 10]} // Center on world
      zoom={2}
      style={{ height: "500px", width: "100%" }}
      className="z-10"
      scrollWheelZoom={false}
      minZoom={1.5}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {validLocations.map((location, index) => (
        <Marker
          key={index}
          position={[location.coordinates.lat, location.coordinates.lng]}
          icon={customIcon}
          eventHandlers={{
            mouseover: () => setHoveredCharity(location),
            mouseout: () => setHoveredCharity(null)
          }}
        >
          <Popup className="charity-popup" maxWidth={300} minWidth={250}>
            {/* Your existing popup content */}
            <div className="px-1 py-2">
              <h3 className="font-bold text-teal-800 mb-1">
                {location.coordinates.country}
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                {location.charities.length} project{location.charities.length !== 1 ? 's' : ''} in this region
              </p>
              
              <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                {location.charities.map(charity => (
                  <div key={charity.id} className="border-b pb-3">
                    {charity.cover_image && (
                      <div className="relative w-full h-24 mb-2">
                        <img
                          src={charity.cover_image}
                          alt={charity.title}
                          className="w-full h-full object-cover rounded-sm"
                        />
                      </div>
                    )}
                    
                    <h4 className="font-semibold text-sm">{charity.title}</h4>
                    
                    {charity.categories && charity.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 my-1">
                        {charity.categories.slice(0, 2).map((cat, i) => (
                          <Badge key={i} variant="outline" className="text-xs py-0">
                            {cat}
                          </Badge>
                        ))}
                        {charity.categories.length > 2 && (
                          <Badge variant="outline" className="text-xs py-0">
                            +{charity.categories.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {charity.introduction}
                    </p>
                    
                    <div className="mt-2 mb-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">
                          {Math.round((30 / 100) * 100)}% funded
                        </span>
                        <span className="font-medium">
                          {30} / {100} ETH
                        </span>
                      </div>
                      <Progress value={(30 / 100) * 100} className="h-1" />
                    </div>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-teal-600 hover:text-teal-700 p-0 mt-2"
                      asChild
                    >
                      <a href={`/charity/browse-projects/${charity.id}`}>
                        View project <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default MapComponent