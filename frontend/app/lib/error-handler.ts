import { json } from '@remix-run/node'
import { toast } from '~/hooks/use-toast'

export interface ApiError {
  message?: string
  errors?: Record<string, string | string[]>
  status?: number
}

export class ApiErrorResponse extends Error {
  public status: number
  public errors?: Record<string, string | string[]>

  constructor(message: string, status: number, errors?: Record<string, string | string[]>) {
    super(message)
    this.name = 'ApiErrorResponse'
    this.status = status
    this.errors = errors
  }
}

export function handleApiError(error: any): ApiErrorResponse {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status
    const data = error.response.data

    if (status === 401) {
      return new ApiErrorResponse('Your session has expired. Please login again.', 401)
    }

    if (status === 403) {
      return new ApiErrorResponse('You do not have permission to perform this action.', 403)
    }

    if (status === 404) {
      return new ApiErrorResponse('The requested resource was not found.', 404)
    }

    if (status === 422 && data.errors) {
      return new ApiErrorResponse(
        data.message || 'Validation failed',
        422,
        data.errors
      )
    }

    if (status === 429) {
      return new ApiErrorResponse('Too many requests. Please try again later.', 429)
    }

    if (status >= 500) {
      return new ApiErrorResponse(
        'A server error occurred. Please try again later.',
        status
      )
    }

    return new ApiErrorResponse(
      data.message || `Request failed with status ${status}`,
      status,
      data.errors
    )
  } else if (error.request) {
    // Request was made but no response
    return new ApiErrorResponse(
      'Unable to connect to the server. Please check your internet connection.',
      0
    )
  } else {
    // Something else happened
    return new ApiErrorResponse(
      error.message || 'An unexpected error occurred',
      0
    )
  }
}

export function createErrorResponse(error: any) {
  const apiError = handleApiError(error)
  
  return json(
    {
      error: apiError.message,
      errors: apiError.errors,
    },
    { status: apiError.status || 500 }
  )
}

export function showErrorToast(error: any) {
  const apiError = handleApiError(error)
  
  toast({
    title: 'Error',
    description: apiError.message,
    variant: 'destructive',
  })
}

export function getFieldError(
  errors: Record<string, string | string[]> | undefined,
  field: string
): string | undefined {
  if (!errors || !errors[field]) return undefined
  
  const error = errors[field]
  return Array.isArray(error) ? error[0] : error
}