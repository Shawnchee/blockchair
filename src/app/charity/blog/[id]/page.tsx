"use client";

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";
import { Card } from "@/components/ui/card";

interface Blog {
    id: string;
    title: string;
    content: string;
    bg_link: string;
    tag:string;
    author:string;
    author_link:string;
    likes:number;
  }

const BlogMainPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: blogData, error: blogErr } = await supabase
        .from("charity_blog")
        .select("*")
        .eq("id", id)
        .single();

      if (blogErr) console.error("Blog fetch error:", blogErr);
      setBlog(blogData);
      console.log(blogData);
     
      setLoading(false);
    };

    fetchData();
  }, [id]);

  if (loading) return 
  (<div className="flex justify-center items-center h-screen">
    <div>
      <h1 className="text-3xl font-bold text-center">Loading...</h1>
    </div>
  </div>);

  return (
    blog &&
    <div className="container mx-auto p-6 mt-15">
      <Card className="p-6 bg-teal-50">
        <div className="flex items-center justify-between">
          <div>
            <img src={blog.bg_link} className="w-full h-50" />
            <h1 className="text-3xl font-bold">{blog.title}</h1>
            <div className="flex items-center text-sm text-muted-foreground">
              <span className="mr-1">By</span>
              <a href={blog.author_link} className="text-primary">{blog.author}</a>
            </div>
          </div>
          
        </div>
        <div className="mt-6 text-black-400" dangerouslySetInnerHTML={{ __html: blog.content }} />
        <div className="mt-6">
          <a href="/charity/blog" className="text-primary">Go back to main page</a>
        </div>
      </Card>
    </div>
  );
};

export default BlogMainPage;