import { HttpException, HttpStatus } from '@nestjs/common';

export interface AppExceptionMetadata {
  [key: string]: unknown;
}

export class AppException extends HttpException {
  public readonly errorCode: string;
  public readonly metadata?: AppExceptionMetadata;

  constructor(
    message: string,
    errorCode: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    metadata?: AppExceptionMetadata,
  ) {
    super(message, status);
    this.errorCode = errorCode;
    this.metadata = metadata;
  }
}

export class NotFoundException extends AppException {
  constructor(message = 'Resource not found', metadata?: AppExceptionMetadata) {
    super(message, 'NOT_FOUND', HttpStatus.NOT_FOUND, metadata);
  }
}

export class UnauthorizedException extends AppException {
  constructor(message = 'Unauthorized', metadata?: AppExceptionMetadata) {
    super(message, 'UNAUTHORIZED', HttpStatus.UNAUTHORIZED, metadata);
  }
}

export class ForbiddenException extends AppException {
  constructor(message = 'Forbidden', metadata?: AppExceptionMetadata) {
    super(message, 'FORBIDDEN', HttpStatus.FORBIDDEN, metadata);
  }
}

export class ConflictException extends AppException {
  constructor(message = 'Conflict', metadata?: AppExceptionMetadata) {
    super(message, 'CONFLICT', HttpStatus.CONFLICT, metadata);
  }
}

export class ValidationException extends AppException {
  constructor(message = 'Validation failed', metadata?: AppExceptionMetadata) {
    super(message, 'VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY, metadata);
  }
}