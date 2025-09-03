import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoomsModule } from './rooms/rooms.module';
import { ReviewsModule } from './reviews/reviews.module';
import { RoomTypesModule } from './room-types/room-types.module';
import { BookingsModule } from './bookings/bookings.module';
import { SupabaseModule } from './common/services/supabase.module';
import { validate } from './config/env.validation';
import { AuthModule } from './auth/auth.module';
import { MiddlewareAuthMiddleware } from './auth/auth.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Làm cho config có thể sử dụng ở mọi nơi
      envFilePath: '.env', // Đường dẫn đến file .env
      validate, // Validate environment variables
    }),
    SupabaseModule,
    RoomsModule,
    ReviewsModule,
    RoomTypesModule,
    BookingsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MiddlewareAuthMiddleware).forRoutes(
      {
      path: 'users/*',
      method: RequestMethod.POST,
    },
    {
      path: 'users/*',
      method: RequestMethod.PATCH,
    },
    {
      path: 'users/*',
      method: RequestMethod.DELETE,
    },
    {
      path: 'users/google/:id',
      method: RequestMethod.GET,
    },
    {
      path:'bookings/*',
      method:RequestMethod.ALL
    },
    {
      path:'bookings',
      method:RequestMethod.ALL
    },
    {
      path:'rooms',
      method: RequestMethod.POST,
    },
    {
      path:'rooms',
      method: RequestMethod.PUT,
    },
    {
      path:'rooms',
      method: RequestMethod.DELETE,
    },
    {
      path:'rooms/geocode',
      method: RequestMethod.POST,
    },
    {
      path:'rooms/like',
      method: RequestMethod.POST,
    },
    {
      path:'rooms/*',
      method: RequestMethod.PUT,
    },
    {
      path:'rooms/*',
      method: RequestMethod.DELETE,
    },
  );
  }
}
