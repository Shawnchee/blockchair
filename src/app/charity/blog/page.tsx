"use client"; // Only needed in Next.js App Router

import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Link from "next/link";

interface BlogProps {
  id: string;
  title: string;
  bg_link: string;
  tag:string;
  author:string;
  likes:number;
}

const BlogCard: React.FC<BlogProps> = ({ id,title, bg_link,tag,author,likes }) => (
  <Link href={`/charity/blog/${id}`} passHref>
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <img src={bg_link} alt={title} className="w-full h-40 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-semibold my-2">{title}</h3>
        {
            tag.split(',').map((tag) => (
                <span key={tag} className="bg-gray-800 text-white text-xs px-2 py-1 rounded-full mr-2">{tag}</span>
            ))
        }
      </div>
    </div>
  </Link>
);

const BlogPage = () => {
  const [blogs, setBlogs] = useState<BlogProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDonations = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("charity_blog").select("*");

      if (error) {
        console.error("Error fetching blogs:", error.message);
      } else {
        setBlogs(data || []);
      }
      setLoading(false);
    };

    fetchDonations();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Browse Fundraisers</h2>
      {loading ? (
        <p>Loading blogs...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogs.map((blogs) => (
            <BlogCard key={blogs.id} {...blogs} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogPage;