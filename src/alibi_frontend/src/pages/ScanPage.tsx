import { QRScanner } from "../components/ui/qr-scanner";

export default function ScanPage() {
    return (
        <main className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Scan Tickets</h1>
            <QRScanner />
        </main>
    )
}

