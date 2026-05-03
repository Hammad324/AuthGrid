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

export class AlreadyExistsException extends AppException {
  constructor(message = 'User Already Exists', metadata?: AppExceptionMetadata) {
    super(message, 'USER_ALREADY_EXISTS', HttpStatus.CONFLICT, metadata);
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

export class SlugConflictException extends AppException {
  constructor(message = 'A tenant with this name already exists', metadata?: AppExceptionMetadata) {
    super(message, 'SLUG_CONFLICT', HttpStatus.CONFLICT, metadata);
  }
}

// export class InternalServerErrorException extends AppException {
//   constructor(message = 'Internal Server Error', metadata?: AppExceptionMetadata) {
//     super(message, 'INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR, metadata);
//   }
// }