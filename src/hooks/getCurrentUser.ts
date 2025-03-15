import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import supabase from "@/utils/supabase/client";

const getCurrentUser = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        return;
      }
      setUser(user);
    };

    fetchUser();
  }, []);

  return user;
};

export default getCurrentUser;