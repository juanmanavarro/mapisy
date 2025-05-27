import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Renderizar la vista 404 con valores por defecto
    response.status(500).render('404', {
      errorCode: '500',
      message: 'An internal server error has occurred'
    });
  }
}
