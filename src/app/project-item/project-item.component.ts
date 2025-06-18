import { Component, input, model, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';

@Component({
    selector: 'project-item',
    imports: [ReactiveFormsModule],
    templateUrl: './project-item.component.html',
    styleUrl: './project-item.component.css'
})
export class ProjectItemComponent {
    projectName = input.required<string>();
    elapsedTime = model(0); // in seconds
    hourlyRate = input<number>(0);
    isRunning = signal(false);
    private subscription: Subscription | null = null;

    startTimer() {
        this.subscription = interval(1000).subscribe(() => this.elapsedTime.update((t) => t + 1));
        this.isRunning.set(true);
    }

    stopTimer() {
        this.subscription?.unsubscribe();
        this.isRunning.set(false);
    }

    formatElapsedTime(): string {
        let t = this.elapsedTime();
        const hours = Math.trunc(t / 3600);
        t = t % 3600;
        const minutes = Math.trunc(t / 60);
        t = t % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${t.toString().padStart(2, '0')}`;
    }
}
