import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, AuthRequest } from '../../src/middleware/auth';
import { db } from '../../src/config/database';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../src/config/database');

const mockJwt = jwt as jest.Mocked<typeof jwt>;
const mockDb = db as jest.MockedFunction<typeof db>;

describe('authenticate middleware', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      cookies: {},
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
    
    // Set up JWT_SECRET for tests
    process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
  });

  it('should authenticate valid JWT token from header', async () => {
    const testUser = { 
      id: 'user-123', 
      email: 'test@example.com',
      username: 'testuser',
      auth_provider: 'local'
    };
    const testToken = 'valid-token';
    const mockConnections = [
      { platform: 'spotify', token_expires_at: new Date(Date.now() + 3600000) }
    ];

    mockReq.headers = { authorization: `Bearer ${testToken}` };
    mockJwt.verify.mockReturnValue({ userId: 'user-123' } as any);
    
    // Mock database calls
    const mockUserQuery = {
      where: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue(testUser)
    };
    const mockConnectionQuery = {
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue(mockConnections)
    };
    
    mockDb.mockReturnValueOnce(mockUserQuery as any)
          .mockReturnValueOnce(mockConnectionQuery as any);

    await authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockJwt.verify).toHaveBeenCalledWith(testToken, 'test-jwt-secret-for-testing-only');
    expect(mockReq.authUser).toEqual({
      id: 'user-123',
      email: 'test@example.com',
      username: 'testuser',
      auth_provider: 'local',
      google_id: undefined,
      connectedPlatforms: ['spotify']
    });
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should return 401 when no token is present', async () => {
    mockReq.headers = {};
    mockReq.cookies = {};

    await authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when user is not found', async () => {
    const testToken = 'valid-token';
    
    mockReq.headers = { authorization: `Bearer ${testToken}` };
    mockJwt.verify.mockReturnValue({ userId: 'nonexistent-user' } as any);
    
    // Mock database calls - user not found
    const mockUserQuery = {
      where: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue(null)
    };
    
    mockDb.mockReturnValueOnce(mockUserQuery as any);

    await authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'User not found' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when JWT token is invalid', async () => {
    mockReq.headers = { authorization: 'Bearer invalid-token' };
    mockJwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(mockNext).not.toHaveBeenCalled();
  });
});