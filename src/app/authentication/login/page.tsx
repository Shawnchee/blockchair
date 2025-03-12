"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import supabase from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="grid md:grid-cols-2 items-center min-h-screen">
      <div className="hidden md:block md:w-full md:h-full md:bg-slate-900"></div>
      <div className="flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-4xl md:text-4xl lg:text-6xl font-bold">Welcome back</h1>
          <p className="text-gray-500 text-xl md:text-lg lg:text-2xl">Sign in to your account to continue</p>
          <form onSubmit={handleLogin} className="mt-10 flex flex-col gap-4 w-full">
            <div>
              <Label className="mb-2" htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label className="mb-2" htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <Button className="cursor-pointer" type="submit">Sign In</Button>
            <a href="/authentication/signup" className="text-blue-500 hover:underline">
            Don't have an account? Sign Up
            </a>
          </form>
        </div>
        
      </div>
      
    </div>
  );
}