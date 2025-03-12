"use client"

import { withQueryClient } from "@/components/HOC/withQueryClient";
import { fetchUserData } from "@/services/userService";
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function Home() {

  return (
    <div>
      <h1>You are logged in</h1>
    </div>
  )
}

export default Home;