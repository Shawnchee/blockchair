"use client"

import { withQueryClient } from "@/components/HOC/withQueryClient";
import { fetchUserData } from "@/services/userService";
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function Home() {
  const { data: userData, error, isLoading} = useQuery({
    queryKey: ['userData'],
    queryFn: fetchUserData,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h1>This is the user below in the database:</h1>
      <pre>{JSON.stringify(userData, null, 2)}</pre>
    </div>
  )
}

export default withQueryClient(Home);