import { ApplicationError } from '@/protocols';

export function paymentRequired(): ApplicationError {
  return {
    name: 'paymentRequired',
    message: 'payment is required!',
  };
}
