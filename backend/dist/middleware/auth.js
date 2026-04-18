import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
export const authenticate = asyncHandler(async (req, _res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
        throw new ApiError(401, 'Authentication required');
    }
    let payload;
    try {
        payload = jwt.verify(token, env.jwtSecret);
    }
    catch {
        throw new ApiError(401, 'Invalid or expired token');
    }
    const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            firstName: true,
            lastName: true,
            name: true,
        },
    });
    if (!user || !user.isActive) {
        throw new ApiError(401, 'User is not active');
    }
    req.user = user;
    next();
});
export const requireRole = (...roles) => (req, _res, next) => {
    if (!req.user) {
        return next(new ApiError(401, 'Authentication required'));
    }
    if (!roles.includes(req.user.role)) {
        return next(new ApiError(403, 'Forbidden'));
    }
    next();
};
