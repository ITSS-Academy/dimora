import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import * as admin from 'firebase-admin';

@Injectable()
export class MiddlewareAuthMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: any, res: any, next: () => void) {
    try {
      let token = req.headers.authorization;

      if (!token) {
        throw new HttpException(
          'Authorization token is required',
          HttpStatus.UNAUTHORIZED
        );
      }

      
      // Remove Bearer from token
      token = token.replace('Bearer ', '');
      
      // Verify Firebase token
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Check if user exists in database, create if not
      let user;
      try {
        user = await this.authService.findOneByGoogleId(decodedToken.uid);
      } catch (error) {
        // User not found, create new user
        user = await this.authService.create({
          id: decodedToken.uid,
          email: decodedToken.email || '',
          full_name: decodedToken.name || '',
          phone: '',
          avatar_url: decodedToken.picture || '',
          google_id: decodedToken.uid,
        });
      }

      next(); // Call the next middleware or route handler
      
    } catch (error) {
      console.error('❌ [AUTH MIDDLEWARE] Authentication failed:', error.message);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      // Handle specific error cases
      if (error.code === 'auth/id-token-expired') {
        throw new HttpException(
          'Token has expired',
          HttpStatus.UNAUTHORIZED
        );
      }
      
      if (error.code === 'auth/id-token-revoked') {
        throw new HttpException(
          'Token has been revoked',
          HttpStatus.UNAUTHORIZED
        );
      }
      
      // User not found error is handled in try-catch above
      // No need to throw error here
      
      throw new HttpException(
        'Authentication failed',
        HttpStatus.UNAUTHORIZED
      );
    }
  }
}
