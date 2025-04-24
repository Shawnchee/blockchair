"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Building2, Globe, MapPin, Phone, Mail, Info, Star } from "lucide-react"
import { useState } from "react"
import { VerifiedBadge } from "@/components/ui/verified-badge"

interface CompanyDetailsProps {
  organizationName: string
  websiteUrl?: string
  location?: string
  contactInfo?: string
  organizationInfo?: string
  trustScore?: number
  verified?: boolean
}

export default function CompanyDetailsPopup({
  organizationName,
  websiteUrl,
  location,
  contactInfo,
  organizationInfo,
  trustScore,
  verified,
}: CompanyDetailsProps) {
  const [open, setOpen] = useState(false)

  // Function to render star rating
  const renderStarRating = (score?: number) => {
    if (!score) return null;

    // Round to nearest 0.5
    const roundedScore = Math.round(score * 2) / 2;
    const fullStars = Math.floor(roundedScore);
    const hasHalfStar = roundedScore % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-1">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        ))}

        {/* Half star - we'll use a full star with a different color for simplicity */}
        {hasHalfStar && (
          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 opacity-60" />
        )}

        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} className="h-5 w-5 text-gray-300" />
        ))}

        <span className="ml-2 text-sm font-medium">{score.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Click to view company details
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <div className="flex items-center gap-2">
              {organizationName}
              {verified && <VerifiedBadge />}
            </div>
          </DialogTitle>
          <DialogDescription>
            Detailed information about this organization
          </DialogDescription>
          {trustScore && (
            <div className="mt-2">
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Trust Score</h4>
              {renderStarRating(trustScore)}
            </div>
          )}
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {websiteUrl && (
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Website</h4>
                <a
                  href={websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {websiteUrl}
                </a>
              </div>
            </div>
          )}

          {location && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Location</h4>
                <p>{location}</p>
              </div>
            </div>
          )}

          {contactInfo && (
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Contact Information</h4>
                <p>{contactInfo}</p>
              </div>
            </div>
          )}

          {organizationInfo && (
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">About the Organization</h4>
                <p className="text-sm whitespace-pre-line">{organizationInfo}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
