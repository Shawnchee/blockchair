"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Star, Info } from "lucide-react"

interface OrganizationDetailsProps {
  name: string
  description: string
  verified: boolean
  trustScore: number
  location: string
  website?: string
  email?: string
}

export default function OrganizationDetailsPopup({
  name,
  description,
  verified,
  trustScore,
  location,
  website,
  email
}: OrganizationDetailsProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white border-white/20 hover:text-white hover:border-white/30"
        >
          <Info className="h-4 w-4" />
          Click for company details
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">{name}</DialogTitle>
            {verified && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Verified
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* Trust Score */}
        <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
          <h4 className="text-sm font-medium text-yellow-800 mb-2 flex items-center">
            <Star className="h-4 w-4 mr-1 text-yellow-600" />
            Trust Score
          </h4>
          <div className="flex items-center">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(trustScore)
                      ? 'text-yellow-400 fill-yellow-400'
                      : i < trustScore
                        ? 'text-yellow-400 fill-yellow-400 opacity-50'
                        : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm font-medium text-yellow-700">
              {trustScore.toFixed(1)}/5
            </span>
          </div>
        </div>

        {/* Organization Description */}
        <div className="mb-4">
          <p className="text-gray-700">{description}</p>
        </div>

        {/* Organization Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-500 mb-1">Location</h4>
            <p>{location}</p>
          </div>
          {website && (
            <div>
              <h4 className="font-medium text-gray-500 mb-1">Website</h4>
              <a
                href={`https://${website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {website}
              </a>
            </div>
          )}
          {email && (
            <div>
              <h4 className="font-medium text-gray-500 mb-1">Email</h4>
              <a
                href={`mailto:${email}`}
                className="text-blue-600 hover:underline"
              >
                {email}
              </a>
            </div>
          )}
        </div>

        {/* Certifications */}
        <div className="mt-4">
          <h4 className="font-medium text-gray-500 mb-2">Certifications</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Registered Charity
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Transparent Reporting
            </Badge>
            {verified && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Verified Organization
              </Badge>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
