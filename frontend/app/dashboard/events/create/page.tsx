
import { authApi } from "@/lib/api/auth";
import { eventApi } from "@/lib/api/events";
import { CreateEventDto } from "@/lib/api/events";
import { EventForm } from "@/components/events/EventForm";
import { checkAuth } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export default function CreateEventPage() {
  async function createEvent(data: CreateEventDto) {
    'use server';
    const token = await checkAuth();
    await eventApi.create(data, token);
    redirect('/dashboard/events');
  }

  return (
    <div className="max-w-4xl mx-auto p-12">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 mb-8">
            Create New Event
        </h1>
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-8 backdrop-blur-sm">
            <EventForm onSubmit={createEvent} />
        </div>
    </div>
  );
}
