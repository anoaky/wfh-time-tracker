import { WritableSignal, signal } from '@angular/core';

export class ProjectData {
    name: WritableSignal<string>;
    elapsedTime: WritableSignal<number>;
    hourlyRate: WritableSignal<number>;

    constructor(name: string, elapsedTime: number = 0, hourlyRate: number = 0) {
        this.name = signal(name);
        this.elapsedTime = signal(elapsedTime);
        this.hourlyRate = signal(hourlyRate);
    }

    sanitize(): { name: string, elapsedTime: number, hourlyRate: number; } {
        return { name: this.name(), elapsedTime: this.elapsedTime(), hourlyRate: this.hourlyRate() };
    }
}