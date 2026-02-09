
import { eventApi } from "@/lib/api/events";
import { EventCard } from "@/components/events/EventCard";
import Link from "next/link";
import { checkAuth } from "@/lib/auth-server";

export default async function AdminEventsPage() {
  const token = await checkAuth();
  // TODO: Add strict role check here (admin only)
  
  const events = await eventApi.findAll();

  return (
    <div className="min-h-screen bg-black text-white p-12">
      <div className="flex justify-between items-center mb-12 border-b border-white/10 pb-8">
        <div>
            <h1 className="text-4xl font-bold text-white mb-2">Manage Events</h1>
            <p className="text-zinc-400">View and manage all organization events</p>
        </div>
        
        <Link 
            href="/dashboard/events/create" 
            className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-lg font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
        >
          + Create Event
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event) => (
          <EventCard key={event.id} event={event} isAdmin={true} />
        ))}
      </div>
    </div>
  );
}
