import { memo, useState, useCallback } from 'react';
import { CalendarClock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Define the Event type that matches what's coming from the backend
interface Event {
  id: number;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string | null;
  artStyle: string;
  ticketTypes: any[];
  totalCapacity: number;
  ticketsSold: number;
  isActive: boolean;
}

interface EventCardProps {
  event: Event;
}

const EventCard = memo(({ event }: EventCardProps) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);
  
  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);
  
  const handleCardClick = useCallback(() => {
    navigate(`/event/${event.id}`);
  }, [navigate, event.id]);
  
  // Calculate some derived values
  const percentageSold = Math.round((Number(event.ticketsSold) / Number(event.totalCapacity)) * 100);
  const ticketTypeCount = event.ticketTypes.length;
  
  // Find starting price (lowest price across ticket types)
  const startingPrice = event.ticketTypes.length > 0
    ? Math.min(...event.ticketTypes.map(type => type.price))
    : 0;
  
  // Format the price
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(startingPrice);
  
  // Truncate description
  const truncatedDescription = event.description.length > 85
    ? `${event.description.substring(0, 85)}...`
    : event.description;
  
  return (
    <div 
      onClick={handleCardClick}
      className="relative w-full rounded-xl overflow-hidden bg-[#191927] hover:bg-[#212133] 
                 transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg transform 
                 hover:-translate-y-1 flex flex-col"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-[#232338] animate-pulse"></div>
        )}
        
        {imageError ? (
          <div className="absolute inset-0 bg-[#232338] flex items-center justify-center text-[#8F8FB2]">
            No Image
          </div>
        ) : (
          <img
            src={event.imageUrl || "/placeholder.svg?height=200&width=400&text=Event+Image"}
            alt={event.name}
            loading="lazy"
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <p className="text-white font-bold text-sm">From {formattedPrice} ICP</p>
        </div>
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-[#E0E0FF] font-semibold text-lg mb-2 line-clamp-1">{event.name}</h3>
        
        <p className="text-[#B0B0D9] text-sm mb-3 line-clamp-2">{truncatedDescription}</p>
        
        <div className="mt-auto space-y-2">
          <div className="flex items-center text-[#9B9BCE] text-xs">
            <CalendarClock className="w-4 h-4 mr-2 text-[#7575BC]" />
            <span>{event.date} • {event.time}</span>
          </div>
          
          <div className="flex items-center text-[#9B9BCE] text-xs">
            <MapPin className="w-4 h-4 mr-2 text-[#7575BC]" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>
      </div>
      
      <div className="absolute top-3 right-3 bg-[#7828CB] text-white px-2 py-1 rounded-md text-xs font-medium">
        {ticketTypeCount} {ticketTypeCount === 1 ? 'Type' : 'Types'}
      </div>
    </div>
  );
});

EventCard.displayName = 'EventCard';

export default EventCard;
