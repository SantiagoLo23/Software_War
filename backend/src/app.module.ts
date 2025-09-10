import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

// Controllers
import { VictimController } from './victims/victims.controller';
import { FeedbackController } from './feedback/feedback.controller';
import { RewardController } from './reward/reward.controller';

// Services
import { VictimService } from './victims/victims.service';
import { FeedbackService } from './feedback/feedback.service';
import { RewardService } from './reward/reward.service';

// Schemas
import { User, UserSchema } from './users/schemas/user.schema';
import { Victim, VictimSchema } from './victims/schemas/victim.schema';
import { Feedback, FeedbackSchema } from './feedback/schemas/feedback.schema';
import { Reward, RewardSchema } from './reward/schemas/reward.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'your-mongodb-uri-here'),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Victim.name, schema: VictimSchema },
      { name: Feedback.name, schema: FeedbackSchema },
      { name: Reward.name, schema: RewardSchema },
    ]),
    AuthModule,
    UsersModule,
  ],
  controllers: [
    VictimController,
    FeedbackController,
    RewardController,
  ],
  providers: [
    VictimService,
    FeedbackService,
    RewardService,
  ],
})
export class AppModule {}
