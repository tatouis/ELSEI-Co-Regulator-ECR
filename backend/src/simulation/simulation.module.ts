import { Module } from '@nestjs/common';
import { SimulationService } from './simulation.service';
import { StateDetectionService } from './state-detection.service';
import { LearnerModule } from '../learner/learner.module';
import { EventsModule } from '../events/events.module';

@Module({
    imports: [LearnerModule, EventsModule],
    providers: [SimulationService, StateDetectionService],
    exports: [SimulationService],
})
export class SimulationModule { }
