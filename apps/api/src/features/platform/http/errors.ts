import type { ContentfulStatusCode } from 'hono/utils/http-status'

export type ErrorEnvelope = {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export class AppError extends Error {
  readonly status: ContentfulStatusCode
  readonly code: string
  readonly details?: unknown

  constructor(
    status: ContentfulStatusCode,
    code: string,
    message: string,
    details?: unknown
  ) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

export function toErrorEnvelope(error: AppError): ErrorEnvelope {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      ...(error.details === undefined ? {} : { details: error.details })
    }
  }
}
