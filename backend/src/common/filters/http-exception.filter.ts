import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Request, Response } from "express";
import { AppException } from "../exceptions/app.exception";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {

    private readonly logger = new Logger(HttpExceptionFilter.name); 

    catch(exception: unknown, host: ArgumentsHost): void {
        const context = host.switchToHttp();
        const response = context.getResponse<Response>();
        const request = context.getRequest<Request>();

        const isDevOrTest = ['dev', 'test'].includes(
            process.env.NODE_ENV ?? 'dev'
        );

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal Server Error';
        let code = 'INTERNAL_SERVER_ERROR';
        let stack: string | undefined;

        if (exception instanceof AppException) {
            status = exception.getStatus();
            code = exception.errorCode;
            message = exception.message;
            stack = isDevOrTest ? exception.stack : undefined;
        } 
        else if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            message = typeof exceptionResponse === 'string'
                ? exceptionResponse
                : (exceptionResponse as any).message ?? exception.message;
            code = HttpStatus[status] ?? 'HTTP_EXCEPTION'
            stack = isDevOrTest ? exception.stack : undefined;
        }
        else if (exception instanceof Error) {
            message = exception.message;
            stack = isDevOrTest ? exception.stack : undefined;
        }

        this.logger.error(
            `[${request.method}] ${request.url} - ${status}: ${message}`,
            stack,
        );

        response.status(status).json({
            success: false,
            error: {
                message,
                code,
                ...(isDevOrTest && stack ? {stack} : {})
            },
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}