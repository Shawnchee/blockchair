"use client"

import CompanyCheck from "@/components/companyCheck";
import { Shield } from "lucide-react"

export default function CompanyCheckPage() {
    return (
        <div className="container mx-auto min-h-screen pt-24 pb-8 px-4 flex flex-col">
            <div className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg p-8 mb-8 shadow-lg">
                <h1 className="text-4xl md:text-5xl font-bold text-white my-8">Company Background Check</h1>
                <p className="text-xl text-white/90 max-w-2xl">
                    Verify the legitimacy and trustworthiness of any company with our comprehensive background check tool.
                </p>
            </div>

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg p-6 shadow border border-gray-100">
                    <div className="flex items-center mb-4">
                        <Shield className="h-6 w-6 text-teal-500 mr-3" />
                        <h3 className="text-xl font-semibold">Verify Legitimacy</h3>
                    </div>
                    <p className="text-gray-600">Check company registration details, SSL certificates, and official records.</p>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow border border-gray-100">
                    <div className="flex items-center mb-4">
                        <Shield className="h-6 w-6 text-teal-500 mr-3" />
                        <h3 className="text-xl font-semibold">Content Analysis</h3>
                    </div>
                    <p className="text-gray-600">Analyze website content for credibility markers and potential red flags.</p>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow border border-gray-100">
                    <div className="flex items-center mb-4">
                        <Shield className="h-6 w-6 text-teal-500 mr-3" />
                        <h3 className="text-xl font-semibold">Risk Assessment</h3>
                    </div>
                    <p className="text-gray-600">Get a comprehensive trustworthiness score and detailed risk evaluation.</p>
                </div>
            </div>

            {/* CompanyCheck Component with Styled Container */}
            <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                <CompanyCheck />
            </div>
        </div>
    );
}