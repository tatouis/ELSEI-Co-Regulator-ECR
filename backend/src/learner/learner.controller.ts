import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { LearnerStore } from './learner.store';
import type { Learner } from './learner.store';

@Controller('learners')
export class LearnerController {
    constructor(private readonly learnerStore: LearnerStore) { }

    @Get()
    getAll(): Learner[] {
        return this.learnerStore.getAll();
    }

    @Get(':id')
    getById(@Param('id') id: string): Learner | undefined {
        return this.learnerStore.getById(id);
    }

    @Post(':id/opt-out')
    toggleOptOut(@Param('id') id: string, @Body('optOut') optOut: boolean) {
        this.learnerStore.update(id, { optOut } as any);
        return { success: true };
    }
}
