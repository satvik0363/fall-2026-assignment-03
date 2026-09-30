import { Request, Response, NextFunction } from 'express';

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // TODO: Student implementation - Part 1: Authentication Middleware
  const header = req.header('X-user-ID');
  if (!header) {
    res.status(401).json({error: "Unauthorized: X-User-ID is missing"});
    return;
  }

  const userID = Number(header);
  if (!Number.isInteger(userID) || userID <= 0) {
    res.status(401).json({error: "Unauthorized: X-User-ID is not a valid number"});
    return;
  }


  // Store the authenticated userId on res.locals.userId
  res.locals.userId = userID;
  next();
}

export default authMiddleware;
