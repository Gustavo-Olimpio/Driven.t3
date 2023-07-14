import { prisma } from '@/config';
import { notFoundError, paymentRequired } from '@/errors';

async function findHotels(userId:number) {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId: userId
    }
  })
  const ticket = await prisma.ticket.findFirst({
    where: {
      enrollmentId: enrollment.id
    }
  }) 
  const ticketType = await prisma.ticketType.findFirst({
    where: {
      id: ticket.ticketTypeId
    }
  })
  if (ticket.status === "RESERVED" || ticketType.isRemote === true || ticketType.includesHotel === false) {
    throw paymentRequired();
  }
  return prisma.hotel.findMany();
}

async function findHotelsById(userId: number, hotelId: number) {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId: userId
    }
  }) 
  if(!enrollment) throw notFoundError();
  const ticket = await prisma.ticket.findFirst({
    where: {
      enrollmentId: enrollment.id
    }
  })
  if(!ticket) throw notFoundError();
  const hotel = await prisma.hotel.findFirst({
    where: {
      id: hotelId
    }
  })
  if(!hotel) throw notFoundError();

  const ticketType = await prisma.ticketType.findFirst({
    where: {
      id: ticket.ticketTypeId
    }
  })
  if (ticket.status === "RESERVED" || ticketType.isRemote === true || ticketType.includesHotel === false) {
    throw paymentRequired();
  }
  const rooms = await prisma.room.findMany({
    where: {
      hotelId: hotelId
    }
  })
  return {
    id: hotel.id,
    name: hotel.name,
    image: hotel.image,
    createdAt: hotel.createdAt.toISOString(),
    updatedAt: hotel.updatedAt.toISOString(),
    Rooms: rooms
  }
}


export default { findHotels, findHotelsById }