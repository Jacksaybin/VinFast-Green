/**
 * Response wrapper utilities
 */

import { Response } from 'express';

export function ok<T>(res: Response, data: T, message = 'Success') {
  return res.json({ success: true, message, data });
}

export function created<T>(res: Response, data: T, message = 'Created') {
  return res.status(201).json({ success: true, message, data });
}

export function noContent(res: Response) {
  return res.status(204).send();
}

export function badRequest(res: Response, message: string, errors?: any) {
  return res.status(400).json({ success: false, error: message, errors });
}

export function unauthorized(res: Response, message = 'Unauthorized') {
  return res.status(401).json({ success: false, error: message });
}

export function forbidden(res: Response, message = 'Forbidden') {
  return res.status(403).json({ success: false, error: message });
}

export function notFound(res: Response, message = 'Not found') {
  return res.status(404).json({ success: false, error: message });
}

export function serverError(res: Response, message = 'Internal server error', error?: any) {
  console.error('Server error:', error);
  return res.status(500).json({ success: false, error: message });
}

export function paginated<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return res.json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}
