import { WritableSignal, signal } from '@angular/core';

export class ProjectData {
    name: string;
    elapsedTime: WritableSignal<number>;
    rate: number;

    constructor(name: string, elapsedTime: WritableSignal<number> = signal(0), rate: number = 0) {
        this.name = name;
        this.elapsedTime = elapsedTime;
        this.rate = rate;
    }

    sanitize(): { name: string, elapsedTime: number, rate: number; } {
        return { name: this.name, elapsedTime: this.elapsedTime(), rate: this.rate };
    }
}
