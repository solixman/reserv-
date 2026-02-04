import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctxType = host.getType();


    if (ctxType === 'http') {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const request = ctx.getRequest();

      const status =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;

      const message =
        exception instanceof HttpException
          ? exception.getResponse()
          : exception instanceof Error
          ? exception.message
          : 'Internal server error';

      response.status(status).json({
        success: false,
        timestamp: new Date().toISOString(),
        path: request.url,
        message,
      });
    }

    
    if (ctxType === 'rpc') {
  let errorResponse: any = {
    message: 'Internal server error',
    statusCode: 500,
  };

  if (exception instanceof RpcException) {
    const error = exception.getError();
    errorResponse =
      typeof error === 'string'
        ? { message: error, statusCode: 500 }
        : { ...error };
  } else if (exception instanceof HttpException) {
    errorResponse = {
      message: exception.message,
      statusCode: exception.getStatus(),
    };
  } else if (exception instanceof Error) {
    errorResponse = {
      message: exception.message,
      statusCode: 500,
    };
  }

  return {
    success: false,
    ...errorResponse,
  };
}


  }
}
