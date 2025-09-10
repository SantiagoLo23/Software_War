import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VictimsService } from './victims.service';
import { VictimsController } from './victims.controller';
import { Victim, VictimSchema } from './schemas/victim.schema';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Victim.name, schema: VictimSchema }]),
    UsersModule,
  ],
  controllers: [VictimsController],
  providers: [VictimsService],
})
export class VictimsModule {}
