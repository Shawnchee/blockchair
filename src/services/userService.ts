import supabase from "@/app/utils/supabase/client";

export async function fetchUserData() {
    const { data: userData, error } = await supabase.from('user').select();
    console.log("asdasda",userData)
    if (error) {
        throw error;
    }
    return userData;
}