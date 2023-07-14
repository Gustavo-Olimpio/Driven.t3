import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import hotelsService from '@/services/hotels-service';

export async function getHotels(req: AuthenticatedRequest, res: Response){
try{
    const hotels = await hotelsService.getHotels();
    return res.send(hotels).status(httpStatus.OK)
} catch (erro){
    if (erro.name === 'NotFoundError') {
        return res.sendStatus(httpStatus.NOT_FOUND);
      }
    return res.sendStatus(httpStatus.BAD_REQUEST);
}
}

export async function getHotelsId(req: AuthenticatedRequest, res: Response){
    const {hotelId} = req.params
    const { userId } = req;
    try{
    const rooms = await hotelsService.getHotelsById(userId,Number(hotelId))
    return res.send(rooms).status(httpStatus.OK)
    } catch (erro){
        if (erro.name === 'NotFoundError') {
            return res.sendStatus(httpStatus.NOT_FOUND);
          }
          if (erro.name === 'paymentRequired') {
            return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
          }
        return res.sendStatus(httpStatus.BAD_REQUEST);
    }
    }