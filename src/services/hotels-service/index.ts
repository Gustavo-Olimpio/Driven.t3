import { notFoundError } from "@/errors";
import hotelsRepository from "@/repositories/hotels-repository";

async function getHotels() {
    const hotels = await hotelsRepository.findHotels();
    if(hotels.length === 0){
        throw notFoundError();
    }
    return hotels
}

async function getHotelsById(userId:number,hotelId:number) {
    return await hotelsRepository.findHotelsById(userId,hotelId)
}

export default {getHotels,getHotelsById}