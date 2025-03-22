"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function WhyUs() {
  return (
    <div className="container mx-auto pt-24 pb-8 p-6 min-h-screen">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">WHY US PLACEHOLDER</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            <strong>Effective Date:</strong> 7/3/2025
          </p>
          <h2 className="text-lg font-semibold mt-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using BlockChair ("the Platform"), you agree to be bound by these Terms & Conditions and our Privacy Policy. If you do not agree, do not use the Platform.
          </p>
          <h2 className="text-lg font-semibold mt-4">2. Description of Service</h2>
          <p>
            BlockChair is a decentralized charity platform enabling users to:
            <ul className="list-disc pl-5">
              <li>View and donate to charitable projects using blockchain technology.</li>
              <li>Analyze wallet security and validate charity authenticity.</li>
              <li>Host and manage charity projects transparently.</li>
            </ul>
          </p>
          <h2 className="text-lg font-semibold mt-4">3. User Responsibilities</h2>
          <p>
            You must be at least 18 years old or have parental consent to use the platform. You agree to use the Platform for lawful, charitable purposes only.
          </p>
          <h2 className="text-lg font-semibold mt-4">4. Donations</h2>
          <p>
            All donations are final and non-refundable. BlockChair does not guarantee the success or outcome of any project.
          </p>
          <h2 className="text-lg font-semibold mt-4">5. Wallet & Security</h2>
          <p>
            You are solely responsible for securing your crypto wallet. We provide tools like Wallet Security Analyzer but do not store or access your private keys.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
