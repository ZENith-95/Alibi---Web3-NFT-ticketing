import { EventCreationForm } from "./EventCreationForm";

export default function EventCreationPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0F0F1A] to-[#1A1A2C] text-[#E0E0FF]">
            <main className="container mx-auto px-4 py-8">
                <EventCreationForm />
            </main>
        </div>
    )
}