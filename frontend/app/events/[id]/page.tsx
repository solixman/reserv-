
import { eventApi } from "@/lib/api/events";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingButton } from "@/components/events/BookingButton";

interface PageProps {
  params: { id: string };
}

export default async function EventDetailsPage({ params }: PageProps) {
  // Await params for Next.js 15+ compatibility
  const { id } = await Promise.resolve(params);
  
  let event = null;
  try {
      event = await eventApi.findOne(+id);
  } catch (error) {
      console.error(`Failed to fetch event ${id}:`, error);
  }

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
        <div className="relative h-[55vh] border-b border-indigo-500/10 overflow-hidden">
            {event.image ? (
                <div className="absolute inset-0">
                    <img 
                        src={event.image} 
                        alt={event.title} 
                        className="w-full h-full object-cover opacity-40 blur-sm scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-indigo-900/20" />
                </div>
            ) : (
                 <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" />
            )}
            
            <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 max-w-7xl mx-auto z-10">
                <div className="flex flex-wrap gap-4 mb-8">
                     <span className={`px-4 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md shadow-lg ${
                        event.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        event.status === 'DRAFT' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' : 
                        'bg-red-500/10 text-red-400 border-red-500/20'
                     }`}>
                        {event.status}
                    </span>
                    <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 backdrop-blur-md shadow-lg">
                        Tech Event
                    </span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white drop-shadow-2xl">{event.title}</h1>
                
                <div className="flex flex-wrap items-center gap-8 text-slate-300 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/5 inline-flex shadow-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Date</p>
                            <p className="font-semibold text-sm">{new Date(event.startDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="w-px h-8 bg-white/10 hidden sm:block"></div>
                    <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Location</p>
                            <p className="font-semibold text-sm">{event.address}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-16 py-20 grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2 space-y-12">
                <div className="prose prose-invert prose-lg max-w-none">
                    <h3 className="text-3xl font-bold mb-8 text-white relative inline-block">
                        About the Event
                        <span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-indigo-500 rounded-full"></span>
                    </h3>
                    <div className="p-8 bg-slate-900/30 border border-slate-800 rounded-3xl backdrop-blur-sm">
                        <p className="text-slate-300 leading-relaxed whitespace-pre-line text-lg">
                            {event.description}
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-8 relative">
                <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 sticky top-8 shadow-2xl shadow-indigo-900/10">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                         <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11h5l-9 13v-9h-5l9-13v9z"/></svg>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-8 font-display">Reservation</h3>
                    <div className="space-y-6 mb-10">
                        <div className="flex justify-between items-center pb-4 border-b border-white/5">
                            <span className="text-slate-400 font-medium">Ticket Price</span>
                            <span className="text-white font-bold text-2xl">Free</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-white/5">
                             <span className="text-slate-400 font-medium">Status</span>
                             <span className={`font-bold ${event.capacity > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {event.capacity > 0 ? 'Available' : 'Sold Out'}
                             </span>
                        </div>
                        <div className="flex justify-between items-center">
                             <span className="text-slate-400 font-medium">Spots Remaining</span>
                             <span className="text-white font-mono bg-white/5 px-3 py-1 rounded-lg">{event.capacity}</span>
                        </div>
                    </div>
                    
                    <BookingButton eventId={event.id} capacity={event.capacity} />
                    <p className="text-center text-xs text-slate-500 mt-6 flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        Secure 256-bit encrypted transaction
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
}
