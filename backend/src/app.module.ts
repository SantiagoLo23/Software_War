import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { VictimsModule } from './victims/victims.module'; // ✅ Importar módulo
import { FeedbackModule } from './feedback/feedback.module'; // ✅ Importar módulo

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/software_war'),
    AuthModule,
    UsersModule,
    VictimsModule, // ✅ Agregar módulos
    FeedbackModule, // ✅ Agregar módulos
  ],
})
export class AppModule {}