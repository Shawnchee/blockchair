import { ScrollArea } from "@/components/ui/scroll-area";

export default function PetActivityLog() {
  const activities = [
    { id: 1, text: "The Magical Panda ✨ ate an apple", time: "2 minutes ago" },
    {
      id: 2,
      text: "The Magical Panda ✨ played with a ball",
      time: "15 minutes ago",
    },
    {
      id: 3,
      text: "You changed The Magical Panda ✨'s outfit",
      time: "1 hour ago",
    },
    { id: 4, text: "The Magical Panda ✨ took a nap", time: "3 hours ago" },
    {
      id: 5,
      text: "You changed the background to Forest",
      time: "5 hours ago",
    },
    { id: 6, text: "The Magical Panda ✨ earned 50 XP", time: "Yesterday" },
  ];

  return (
    <ScrollArea className="h-[200px]">
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="border-b pb-2 last:border-0">
            <p className="text-sm">{activity.text}</p>
            <p className="text-xs text-muted-foreground">{activity.time}</p>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
