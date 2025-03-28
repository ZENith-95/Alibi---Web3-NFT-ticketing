// Mock events data
export const mockEvents = [
  {
    id: "1",
    name: "Neon Nights 2024",
    date: "2024-06-15",
    time: "8:00 PM",
    location: "Quantum Arena, San Francisco",
    capacity: 500,
    ticketsSold: 380,
    imageUrl: "/placeholder.svg?height=400&width=800&text=Neon+Nights",
    artStyle: "cyberpunk",
  },
  {
    id: "2",
    name: "Blockchain Summit",
    date: "2024-07-22",
    time: "9:00 AM",
    location: "Tech Center, New York",
    capacity: 300,
    ticketsSold: 210,
    imageUrl: "/placeholder.svg?height=400&width=800&text=Blockchain+Summit",
    artStyle: "minimalist",
  },
  {
    id: "3",
    name: "Digital Art Exhibition",
    date: "2024-05-10",
    time: "10:00 AM",
    location: "Modern Gallery, Los Angeles",
    capacity: 150,
    ticketsSold: 150,
    imageUrl: "/placeholder.svg?height=400&width=800&text=Digital+Art",
    artStyle: "abstract",
  },
  {
    id: "4",
    name: "Future of Web3 Conference",
    date: "2024-08-05",
    time: "10:00 AM",
    location: "Innovation Center, Austin",
    capacity: 400,
    ticketsSold: 120,
    imageUrl: "/placeholder.svg?height=400&width=800&text=Web3+Conference",
    artStyle: "futuristic",
  },
]

// Mock tickets data
export const mockTickets = [
  {
    id: "t1",
    eventId: "1",
    eventName: "Neon Nights 2024",
    eventDate: "2024-06-15",
    eventTime: "8:00 PM",
    eventLocation: "Quantum Arena, San Francisco",
    imageUrl: "/placeholder.svg?height=300&width=200&text=Neon+Nights+Ticket",
    status: "active",
    unlockables: {
      total: 3,
      unlocked: 1,
    },
  },
  {
    id: "t2",
    eventId: "2",
    eventName: "Blockchain Summit",
    eventDate: "2024-07-22",
    eventTime: "9:00 AM",
    eventLocation: "Tech Center, New York",
    imageUrl: "/placeholder.svg?height=300&width=200&text=Blockchain+Summit+Ticket",
    status: "active",
    unlockables: {
      total: 2,
      unlocked: 0,
    },
  },
  {
    id: "t3",
    eventId: "3",
    eventName: "Digital Art Exhibition",
    eventDate: "2024-05-10",
    eventTime: "10:00 AM",
    eventLocation: "Modern Gallery, Los Angeles",
    imageUrl: "/placeholder.svg?height=300&width=200&text=Digital+Art+Ticket",
    status: "used",
    unlockables: {
      total: 3,
      unlocked: 3,
    },
  },
]

