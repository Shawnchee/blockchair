"use client"

import { Suspense } from "react"
import ServiceProviderList from "@/components/ServiceProviderList"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users } from "lucide-react"

export default function ServiceProvidersPage() {
  return (
    <div className="container mx-auto pt-24 pb-8 min-h-screen px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Service Providers</h2>
          <p className="text-gray-600">Find and connect with verified service providers for your projects</p>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-8 rounded-t-lg">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 rounded-full p-3">
                <Building2 className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight mb-2">Our Service Providers</CardTitle>
            <CardDescription className="text-white/90 max-w-2xl mx-auto">
              Browse our network of trusted service providers and view their project portfolios
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          <Suspense fallback={<div>Loading service providers...</div>}>
            <ServiceProviderList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
