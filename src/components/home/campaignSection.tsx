import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Shield, Users, Smartphone, Award } from 'lucide-react';

const CampaignSection = () => {
  return (
    <div className="bg-white">
      {/* Features Section */}
      <div className="w-full bg-emerald-500 text-white py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">
            Fundhive have everything you need
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center md:items-start space-y-3">
              <Shield className="w-8 h-8 mb-2" />
              <h3 className="font-semibold text-xl">Secure</h3>
              <p className="text-sm text-center md:text-left">
                Our Trust & Safety team works around the clock to protect against fraud.
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-start space-y-3">
              <Award className="w-8 h-8 mb-2" />
              <h3 className="font-semibold text-xl">Donor protection guarantee</h3>
              <p className="text-sm text-center md:text-left">
                Fundhive has the first and only donor guarantee in the industry.
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-start space-y-3">
              <Users className="w-8 h-8 mb-2" />
              <h3 className="font-semibold text-xl">Social reach</h3>
              <p className="text-sm text-center md:text-left">
                Harness the power of social media to spread your story and get more support.
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-start space-y-3">
              <Smartphone className="w-8 h-8 mb-2" />
              <h3 className="font-semibold text-xl">Social reach</h3>
              <p className="text-sm text-center md:text-left">
                The Fundhive app makes it simple to launch and manage your fundraiser on the go.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Campaigns Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">
            Our Recent <span className="text-emerald-500">Campaigns</span>
          </h2>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" className="rounded-full">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Campaign Card 1 */}
          <Card>
            <div className="relative h-48 w-full">
              <Image 
                src="/test.jpg" 
                alt="Abandoned animals campaign" 
                fill
                className="object-cover rounded-t-lg"
              />
            </div>
            <CardHeader>
              <CardTitle className="text-xl">Save Thousands of Abandoned Animals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Every year, countless animals are abandoned and left to fend for themselves. These animals often face hunger, thirst, disease, and danger. Fortunately, there are many ways in which you can help these animals, and one of the most impactful ways is through donations.
              </p>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <p className="font-semibold">$4,174 raised</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div className="bg-emerald-500 h-2.5 rounded-full w-1/4"></div>
              </div>
            </CardFooter>
          </Card>
          
          {/* Campaign Card 2 */}
          <Card>
            <div className="relative h-48 w-full">
              <Image 
                src="/test.jpg" 
                alt="Education access campaign" 
                fill
                className="object-cover rounded-t-lg"
              />
            </div>
            <CardHeader>
              <CardTitle className="text-xl">Help Us Provide Access to Education</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Education is one of the most important factors that contribute to the growth and development of individuals and societies. By donating to educational initiatives or organizations that support education, you can help provide resources such as books, school supplies, and more.
              </p>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <p className="font-semibold">$6,125 raised of $9,000</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div className="bg-emerald-500 h-2.5 rounded-full w-2/3"></div>
              </div>
            </CardFooter>
          </Card>
          
          {/* Campaign Card 3 */}
          <Card>
            <div className="relative h-48 w-full">
              <Image 
                src="/test.jpg" 
                alt="Cancer fighters support campaign" 
                fill
                className="object-cover rounded-t-lg"
              />
            </div>
            <CardHeader>
              <CardTitle className="text-xl">Support and Help Cancer Fighters</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Cancer patients and their families often face significant challenges during treatment, including financial burdens, emotional stress, and physical discomfort. Your donation can help provide essential services such as transportation to medical appointments.
              </p>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <p className="font-semibold">$7,789 raised</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div className="bg-emerald-500 h-2.5 rounded-full w-1/2"></div>
              </div>
            </CardFooter>
          </Card>
        </div>
        
        <div className="flex justify-end mt-6">
          <Button variant="link" className="text-emerald-500 flex items-center">
            View all <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CampaignSection;