// Simple in-memory store for tickets (replace with DB in production)
const tickets: Record<string, any> = {}
let ticketCounter = 1

export function createTicket(data: any) {
  const id = `TKT-${String(ticketCounter).padStart(4, "0")}`
  ticketCounter++
  const ticket = {
    id,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "pending",
  }
  tickets[id] = ticket
  return ticket
}

export function getTickets() {
  return Object.values(tickets)
}

export function getTicketById(id: string) {
  return tickets[id]
}

export function updateTicket(id: string, data: any) {
  if (!tickets[id]) return null
  tickets[id] = {
    ...tickets[id],
    ...data,
    updatedAt: new Date().toISOString(),
  }
  return tickets[id]
}

export function deleteTicket(id: string) {
  delete tickets[id]
}
