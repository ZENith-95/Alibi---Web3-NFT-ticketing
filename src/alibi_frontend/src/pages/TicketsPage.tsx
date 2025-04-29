
import { TicketGallery } from "../components/ticket-gallery"
export default function TicketsPage() {
    return (
        <main className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Tickets</h1>
            <TicketGallery />
        </main>
    )
}

