"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import getCurrentUser from "@/hooks/getCurrentUser";
import { Session } from "@supabase/supabase-js";
import supabase from "@/utils/supabase/client";


const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Check session on mount and listen for auth state changes
  useEffect(() => {
    // Get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for changes in the auth state
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
      }
    );


    // Cleanup the listener on unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const user = getCurrentUser();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>
          <h1 className="text-3xl font-bold text-center">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!loading && !session) {
    router.push("/authentication/login");
  }

  return (
    <>
      {session ? (
        <>{children}</>
      ) : (
        <div className="flex justify-center items-center h-screen">
          <div>
            <h1 className="text-3xl font-bold text-center">Please sign in to continue</h1>
          </div>
        </div>
      )}
    </>
  );  
};


export default AuthWrapper;