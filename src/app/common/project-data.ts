import { WritableSignal, signal } from '@angular/core';

export class ProjectData {
    name: string;
    elapsedTime: WritableSignal<number>;
    hourlyRate: WritableSignal<number>;

    constructor(name: string, elapsedTime: WritableSignal<number> = signal(0), hourlyRate: WritableSignal<number> = signal(0)) {
        this.name = name;
        this.elapsedTime = elapsedTime;
        this.hourlyRate = hourlyRate;
    }

    sanitize(): { name: string, elapsedTime: number, hourlyRate: number; } {
        return { name: this.name, elapsedTime: this.elapsedTime(), hourlyRate: this.hourlyRate() };
    }
}