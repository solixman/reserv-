import { Event } from "@/lib/api/events";
import Link from "next/link";

interface EventCardProps {
  event: Event;
  isAdmin?: boolean;
}

export function EventCard({ event, isAdmin }: EventCardProps) {
  const statusColors = {
    DRAFT: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    PUBLISHED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    CANCELED: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <div className="group relative bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-900/10">
      {/* Image Placeholder */}
      <div className="aspect-video bg-zinc-800 relative overflow-hidden">
        {event.image ? (
            <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-700 font-bold text-2xl bg-gradient-to-br from-zinc-800 to-zinc-900">
             NO IMAGE
            </div>
        )}
        
        <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md ${statusColors[event.status]}`}>
                {event.status}
            </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">{event.title}</h3>
        </div>

        <p className="text-zinc-400 text-sm mb-6 line-clamp-2 h-10">
          {event.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-zinc-500 mb-6 font-mono">
            <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                {new Date(event.startDate).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                {event.address}
            </div>
        </div>

        <div className="flex gap-3">
          {isAdmin ? (
             <Link href={`/dashboard/events/${event.id}/edit`} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-center py-2.5 rounded-lg text-sm font-medium transition-colors border border-white/5">
                Edit
             </Link>
          ) : (
             <Link href={`/events/${event.id}`} className="flex-1 bg-white hover:bg-zinc-200 text-black text-center py-2.5 rounded-lg text-sm font-bold transition-colors">
                View Details
             </Link>
          )}
        </div>
      </div>
    </div>
  );
}
