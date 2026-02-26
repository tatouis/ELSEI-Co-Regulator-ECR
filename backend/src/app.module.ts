import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SimulationModule } from './simulation/simulation.module';
import { LearnerModule } from './learner/learner.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [SimulationModule, LearnerModule, EventsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
