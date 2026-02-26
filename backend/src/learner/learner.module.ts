import { Module } from '@nestjs/common';
import { LearnerStore } from './learner.store';
import { LearnerController } from './learner.controller';

@Module({
    controllers: [LearnerController],
    providers: [LearnerStore],
    exports: [LearnerStore],
})
export class LearnerModule { }
