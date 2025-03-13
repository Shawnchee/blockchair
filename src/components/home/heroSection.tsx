import React from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const HeroSection = () => {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter">
            Join the <span className="text-emerald-500">movement</span> 
            <br />and be a part of
            <br />something bigger
          </h1>
          
          <p className="text-lg text-gray-600">
            Create a culture of giving, enabling individuals and organizations 
            to support causes that align with their values and make a positive 
            impact on the world.
          </p>
          
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-6 rounded-md text-lg h-auto">
            Donate Now
          </Button>
          
          <div className="grid grid-cols-3 gap-4 pt-10">
            <div>
              <h3 className="text-4xl font-bold">60+</h3>
              <p className="text-gray-600">fundraises per year</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold">$750 million+</h3>
              <p className="text-gray-600">raised per year</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold">250,000+</h3>
              <p className="text-gray-600">fundraiser per year</p>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <Image 
            src="/test.jpg" 
            alt="Hands holding coins with 'Make a Change' message"
            width={600}
            height={700}
            className="rounded-lg object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;