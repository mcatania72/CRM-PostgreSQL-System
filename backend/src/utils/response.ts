import { Response } from 'express';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: any[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class ResponseHelper {
  static success<T>(
    res: Response,
    data?: T,
    message?: string,
    statusCode = 200
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data
    };
    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string,
    statusCode = 500,
    errors?: any[]
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: message,
      errors
    };
    return res.status(statusCode).json(response);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    total: number,
    page: number,
    limit: number,
    message?: string
  ): Response {
    const response: ApiResponse<T[]> = {
      success: true,
      message,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
    return res.status(200).json(response);
  }

  static created<T>(
    res: Response,
    data: T,
    message = 'Resource created successfully'
  ): Response {
    return this.success(res, data, message, 201);
  }

  static notFound(
    res: Response,
    message = 'Resource not found'
  ): Response {
    return this.error(res, message, 404);
  }

  static badRequest(
    res: Response,
    message = 'Bad request',
    errors?: any[]
  ): Response {
    return this.error(res, message, 400, errors);
  }

  static unauthorized(
    res: Response,
    message = 'Unauthorized'
  ): Response {
    return this.error(res, message, 401);
  }

  static forbidden(
    res: Response,
    message = 'Forbidden'
  ): Response {
    return this.error(res, message, 403);
  }

  static conflict(
    res: Response,
    message = 'Conflict'
  ): Response {
    return this.error(res, message, 409);
  }

  static validationError(
    res: Response,
    errors: any[],
    message = 'Validation failed'
  ): Response {
    return this.error(res, message, 422, errors);
  }
}