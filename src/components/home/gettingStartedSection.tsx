"use client"

import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from "next/navigation"
import FeatureCarousel from '../features-carousel';




export default function GettingStartedSection(){
    const router = useRouter()

    return (
        <>
            <section id="getting-started" className="bg-gray-100">
                <div className="container mx-auto px-4 py-16 md:py-24">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-6">
                        <h2 className="text-5xl md:text-6xl font-bold tracking-tighter ">
                        Get started in minutes
                        </h2>
        
                        <p className="text-lg text-gray-400">
                        Create a culture of giving, enabling individuals and organizations to support causes that align with their
                        values and make a positive impact on the world.
                        </p>
        
                        <div>
                        <Button onClick={()=> router.push("/charity/browse-projects")}className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-6 rounded-md text-lg h-auto group transition-all duration-300 ease-in-out hover:scale-105 shadow-lg hover:shadow-emerald-300/50">
                            Donate Now
                            <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                        </Button>
                        </div>
                    </div>
        
                    <div className="relative">
                        <img
                        src="https://jalcuslxbhoxepybolxw.supabase.co/storage/v1/object/public/main-page-assets//donation-ez.gif"
                        alt="Get started in minutes"
                        className="rounded-lg shadow-lg"
                        />
                    </div>
                    </div>
                </div>
            </section>
            <section>
                <FeatureCarousel />
            </section>
        </>
    )
}
