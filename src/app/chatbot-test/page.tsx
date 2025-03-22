import ChatbotComponent from "@/components/chatbotComponent"

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">My Website</h1>
      <p className="mb-4">
        Welcome to my website! Click the chat button in the bottom right corner to start a conversation.
      </p>

      {/* Chatbot Component */}
      <ChatbotComponent />
    </main>
  )
}

