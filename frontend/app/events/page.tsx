import Link from "next/link";
import { eventApi } from "@/lib/api/events";
import { EventCard } from "@/components/events/EventCard";
import { Header } from "@/components/layout/Header";

export default async function PublicEventsPage() {
  let events: any[] = [];
  try {
      events = await eventApi.findAll();
  } catch (error) {
      console.error("Failed to fetch events:", error);
  }
  
  // Filter for PUBLISHED only
  const publishedEvents = events.filter(e => e.status === 'PUBLISHED');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Hero Section */}
      <section className="relative h-[55vh] flex items-center justify-center overflow-hidden border-b border-indigo-500/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950 z-0" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-[1]"></div>
        
        <Header />
        
        <div className="z-10 text-center max-w-4xl px-8 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium tracking-wide uppercase mb-8 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            Explore The Future
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight text-white drop-shadow-xl">
            Where Ideas <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Converge</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 font-light leading-relaxed max-w-2xl mx-auto">
            Discover curated tech events, workshops, and gatherings designed to inspire and connect.
          </p>
        </div>
      </section>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="mb-16 border-b border-slate-800/50 pb-6 flex items-end justify-between">
            <div>
                 <h2 className="text-4xl font-bold text-white mb-2">Upcoming Events</h2>
                 <p className="text-slate-500">Don't miss out on these opportunities</p>
            </div>
        </div>

        {publishedEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedEvents.map((event) => (
                <EventCard key={event.id} event={event} isAdmin={false} />
            ))}
            </div>
        ) : (
            <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed">
                <p className="text-slate-500 text-lg">No upcoming events at the moment.</p>
                <p className="text-slate-600 text-sm mt-2">Check back later for updates.</p>
            </div>
        )}
      </div>
    </div>
  );
}
