import { WritableSignal, signal } from '@angular/core';

export class ProjectData {
    name: string;
    elapsedTime: WritableSignal<number>;

    constructor(name: string, elapsedTime: WritableSignal<number> = signal(0)) {
        this.name = name;
        this.elapsedTime = elapsedTime;
    }

    sanitize(): { name: string, elapsedTime: number; } {
        return { name: this.name, elapsedTime: this.elapsedTime() };
    }
}
