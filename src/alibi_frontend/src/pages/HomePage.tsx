import { EventDiscovery } from "../components/EventDiscovery"
import { HeroSection } from "../components/HeroSection"
import { MobileNavigation } from "../components/MobileNavigation"
import { SiteHeader } from "../components/SiteHeader"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0F1A] to-[#1A1A2C] text-[#E0E0FF]">
      <SiteHeader />
      <main>
        <HeroSection />
        <EventDiscovery />
      </main>
      <MobileNavigation />
    </div>
  )
}
