import { Router } from 'express';
import { authenticateToken} from '@/middlewares';
import { getHotels,getHotelsId } from '@/controllers';

const hotelsRouter = Router();

hotelsRouter
  .all('/*', authenticateToken)
  .get('/', getHotels)
  .get('/:hotelId',getHotelsId )
  

export { hotelsRouter };
