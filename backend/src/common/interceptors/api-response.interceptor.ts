import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Request } from "express";

export interface ApiResponse<T> {
    success: boolean;
    timestamp: string;
    statusCode: number;
    data: T;
    message: string;
    path: string;
}

@Injectable()
export class ApiResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
        const request = context.switchToHttp().getRequest<Request>();

        return next.handle().pipe(map(data => {
            
            const message = data?.message ?? "Success";
            const responseData = data?.message ? (data.data ?? data) : data;

            return {
                success: true,
                timestamp: new Date().toISOString(),
                statusCode: context.switchToHttp().getResponse().statusCode,
                data: responseData,
                message,
                path: request.url
            };
        }));
    }
}