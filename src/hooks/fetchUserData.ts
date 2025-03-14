import supabase from "@/utils/supabase/client"
import { useEffect, useState } from "react";

const fetchUserData =  async (userId: string | undefined) => {

    const { data: userData, error } = await supabase
    .from('users')
    .select('*')
    .eq("id", userId)
    .single();

    if (error) {
        console.error("Error fetching user data:", error);
        return null;
    }
    return userData; 
}

export const useUserData = (userId: string | undefined) => {
    const [userData, setUserData] = useState<any | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const userData = await fetchUserData(userId);
            setUserData(userData);
        };

        fetchUser();
    }, [userId]);

    return userData;
}
