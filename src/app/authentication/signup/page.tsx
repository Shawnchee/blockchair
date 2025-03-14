"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import supabase from "@/utils/supabase/client";
import { userSchema } from "@/services/formValidationSchemas";
import { z } from "zod";

export default function SignUpPage() {
  const router = useRouter();
  const [tab, setTab] = useState("donor");
  const [formData, setFormData] = useState({
    role: tab,
    fullName: "",
    identityNumber: "",
    phoneNumber: "",
    organizationName: "",
    registrationNumber: "",
    contactPerson: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: (e.target as HTMLInputElement).value });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    formData.role = tab;

    try {
      // Validate form data with Zod
      console.log('Form Data', formData)
      userSchema.parse(formData);

      // Sign up the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });
      console.log("Signed up", authData);

      // TODO: link authData.user.id with user data in the Users table

      // Insert user data into the Users table
      const { error: userError } = await supabase.from("users").insert([
        {
            
          email: formData.email,
          password: formData.password, // Store hashed password in real cases!
          role: tab,
          fullname: formData.fullName || null,
          identitynumber: formData.identityNumber || null,
          phonenumber: formData.phoneNumber,
          organizationname: tab === "organization" ? formData.organizationName : null,
          registrationnumber: tab === "organization" ? formData.registrationNumber : null,
          contactperson: tab === "organization" ? formData.contactPerson : null,
        },
      ]);

      console.log("Created user", userError);

      if (userError) {
        setError(userError.details);
        throw new Error(userError.message.replace("Key (email)=", ""));
      };

      // Redirect to home page after successful signup
      router.push("/authentication/login");
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } 
    }
  };

  return (
    <div className="grid md:grid-cols-2 items-center min-h-screen">
      <div className="hidden md:block md:w-full md:h-full md:bg-slate-900"></div>
      <div className="flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 py-16">
          <h1 className="text-4xl md:text-4xl lg:text-6xl font-bold">Create an account</h1>
          <p className="text-gray-500 text-xl md:text-lg lg:text-2xl">Sign up to get started</p>
          <div className="flex gap-4 mt-4">
            <Button onClick={() => setTab("donor")} className={`cursor-pointer  ${tab === "donor" ? "bg-blue-500" : ""}`}>Donor</Button>
            <Button onClick={() => setTab("organization")} className={`cursor-pointer  ${tab === "organization" ? "bg-blue-500" : ""}`}>Organization</Button>
          </div>
          <form onSubmit={handleSignUp} className="mt-10 flex flex-col gap-4 w-full">
            {tab === "donor" && (
              <>
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" type="text" value={formData.fullName} onChange={handleChange}  />
                <Label htmlFor="identityNumber">Identity Number</Label>
                <Input id="identityNumber" type="text" value={formData.identityNumber} onChange={handleChange}  />
              </>
            )}
            {tab === "organization" && (
              <>
                <Label htmlFor="organizationName">Organization Name</Label>
                <Input id="organizationName" type="text" value={formData.organizationName} onChange={handleChange}  />
                <Label htmlFor="registrationNumber">Registration Number</Label>
                <Input id="registrationNumber" type="text" value={formData.registrationNumber} onChange={handleChange}  />
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input id="contactPerson" type="text" value={formData.contactPerson} onChange={handleChange}  />
              </>
            )}
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input id="phoneNumber" type="text" value={formData.phoneNumber} onChange={handleChange}  />
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={formData.email} onChange={handleChange}  />
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={formData.password} onChange={handleChange}  />
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange}  />
            {error && <p className="text-red-500">{error}</p>}
            <Button className="cursor-pointer" type="submit">Sign Up</Button>
            <a href="/authentication/login" className="text-blue-500 hover:underline text-center">
              Already have an account? Sign In
            </a>
          </form>
        </div>
      </div>
    </div>
  );
}
