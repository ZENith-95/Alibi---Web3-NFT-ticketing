import { Principal } from "@dfinity/principal"

export interface Event {
  id: bigint
  name: string
  description: string
  date: string
  time: string
  location: string
  organizer: Principal
  imageUrl: string | null
  artStyle: string
  ticketTypes: TicketType[]
  totalCapacity: bigint
  ticketsSold: bigint
  isActive: boolean
  createdAt: bigint
}
