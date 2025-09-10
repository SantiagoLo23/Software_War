import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VictimService } from './victims.service';
import { VictimController } from './victims.controller';
import { Victim, VictimSchema } from './schemas/victim.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Victim.name, schema: VictimSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [VictimController],
  providers: [VictimService],
  exports: [VictimService],
})
export class VictimsModule {}
