"use client"; // Only needed in Next.js App Router

import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

interface DonationProps {
  id: number;
  title: string;
  location: string;
  cover_image: string;
  total_amount: number;
}

const DonationCard: React.FC<DonationProps> = ({ id,title, location, cover_image, total_amount }) => (
  <Link href={`/donate/${id}`} passHref>
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <img src={cover_image} alt={title} className="w-full h-40 object-cover" />
      <div className="p-4">
        <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded-full">{location}</span>
        <h3 className="text-lg font-semibold mt-2">{title}</h3>
        <p className="text-green-600 font-bold">
          ${total_amount ? total_amount.toLocaleString() : "0"} raised
        </p>
      </div>
    </div>
  </Link>
);

const DonationPage = () => {
  const [donations, setDonations] = useState<DonationProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDonations = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("charity_2").select("*");

      if (error) {
        console.error("Error fetching donations:", error.message);
      } else {
        setDonations(data || []);
      }
      setLoading(false);
    };

    fetchDonations();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Browse Fundraisers</h2>
      {loading ? (
        <p>Loading donations...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {donations.map((donation) => (
            <DonationCard key={donation.id} {...donation} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DonationPage;
