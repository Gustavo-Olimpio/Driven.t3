import faker from '@faker-js/faker';
import { TicketStatus } from '@prisma/client';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import {
  createEnrollmentWithAddress,
  createUser,
  createTicketType,
  createTicket,
  createPayment,
  generateCreditCardData,
  createHotel,
} from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import { prisma } from '@/config';
import app, { init } from '@/app';

beforeAll(async () => {
    await init();
    await cleanDb();
  });
  beforeEach(async () => {
    await cleanDb();
  });
  
  const server = supertest(app);

  describe('GET /hotels', () => {
    it('should respond with status 401 if no token is given', async () => {
      const response = await server.get('/hotels');
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();
    
        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });
    
      it('should respond with status 401 if there is no session for given token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });
      describe('when token is valid', () => {
        it('should respond with status 404 if search result is empty', async () => {
          const token = await generateValidToken();
    
          const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
            
          expect(response.status).toEqual(httpStatus.NOT_FOUND);
        });
        it('should respond with status 200 if search result exists', async () => {
            await createHotel();
            const token = await generateValidToken();
      
            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
            expect(response.status).toEqual(httpStatus.OK);
          });
    });
});
describe('GET /hotels/id', () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.get('/hotels/1');
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });
      it('should respond with status 401 if given token is not valid', async () => {
          const token = faker.lorem.word();
      
          const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);
      
          expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
      
        it('should respond with status 401 if there is no session for given token', async () => {
          const userWithoutSession = await createUser();
          const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
      
          const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);
      
          expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
        describe('when token is valid', () => {
            it('should respond with status 404 if enrollment no exists', async () => {
                const token = await generateValidToken();
                const hotel = await createHotel();
                const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);
                expect(response.status).toBe(httpStatus.NOT_FOUND);
              });
              it('should respond with status 404 if ticket no exists', async () => {
                const user = await createUser();
                const token = await generateValidToken(user);
                await createEnrollmentWithAddress(user);
                const hotel = await createHotel();
                const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);
                expect(response.status).toBe(httpStatus.NOT_FOUND);
              });
              it('should respond with status 404 if hotel no exists', async () => {
                const user = await createUser();
                const token = await generateValidToken(user);
                const enrollment = await createEnrollmentWithAddress(user);
                const ticketType = await createTicketType();
                const ticket = await createTicket(enrollment.id,ticketType.id,"RESERVED");
                const response = await server.get(`/hotels/1`).set('Authorization', `Bearer ${token}`);
                expect(response.status).toBe(httpStatus.NOT_FOUND);
              });
              it('must respond with status 402 if the ticket has not been paid', async () => {
                const user = await createUser();
                const token = await generateValidToken(user);
                const enrollment = await createEnrollmentWithAddress(user);
                const ticketType = await createTicketType();
                const ticket = await createTicket(enrollment.id,ticketType.id,"RESERVED");
                const hotel = await createHotel();
                const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);
                expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
              });
              it('should respond with status 402 if ticketType is remote', async () => {
                const user = await createUser();
                const token = await generateValidToken(user);
                const enrollment = await createEnrollmentWithAddress(user);
                const ticketType = await prisma.ticketType.create({
                    data:{
                        name:"Qualquer",
                        price:123,
                        isRemote:true,
                        includesHotel:true
                    }
                });
                const ticket = await createTicket(enrollment.id,ticketType.id,"PAID");
                const hotel = await createHotel();
                const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);
                expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
              });
              it('must respond with status 402 if ticketType does not include hotel', async () => {
                const user = await createUser();
                const token = await generateValidToken(user);
                const enrollment = await createEnrollmentWithAddress(user);
                const ticketType = await prisma.ticketType.create({
                    data:{
                        name:"Qualquer",
                        price:123,
                        isRemote:false,
                        includesHotel:false
                    }
                });
                const ticket = await createTicket(enrollment.id,ticketType.id,"PAID");
                const hotel = await createHotel();
                const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);
                expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
              });
              it('must respond with status 200 if all is correct', async () => {
                const user = await createUser();
                const token = await generateValidToken(user);
                const enrollment = await createEnrollmentWithAddress(user);
                const ticketType = await prisma.ticketType.create({
                    data:{
                        name:"Qualquer",
                        price:123,
                        isRemote:false,
                        includesHotel:true
                    }
                });
                const ticket = await createTicket(enrollment.id,ticketType.id,"PAID");
                const hotel = await createHotel();
                const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);
                expect(response.status).toBe(httpStatus.OK);
              });
    });
});