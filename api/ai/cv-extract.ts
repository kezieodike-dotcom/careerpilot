import { app } from '../../server';

export default function handler(request: any, response: any) {
  return app(request, response);
}
