import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { VictimsModule } from './victims/victims.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || ''),
    UsersModule,
    VictimsModule,
    AuthModule,
  ],
})
export class AppModule {}
