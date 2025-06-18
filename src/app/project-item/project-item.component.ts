import { Component, input, model, signal, output } from '@angular/core';
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
    isRunning = signal(false);
    deleteProject = output<void>();
    private subscription: Subscription | null = null;

    startTimer() {
        this.subscription = interval(1000).subscribe(() => this.elapsedTime.update((t) => t + 1));
        this.isRunning.set(true);
    }

    stopTimer() {
        this.subscription?.unsubscribe();
        this.isRunning.set(false);
    }

    resetTimer() {
        this.stopTimer();
        this.elapsedTime.set(0);
    }

    timerStyle(): string {
        const common = "text-2xl font-mono font-bold text-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1 rounded-lg border";
        if (this.isRunning()) {
            return `project-time-running ${common}`;
        } else if (this.elapsedTime() == 0) {
            return `project-time ${common}`;
        } else {
            return `project-time-stopped ${common}`;
        }
    }

    formatElapsedTime(): string {
        let t = this.elapsedTime();
        const hours = Math.trunc(t / 3600);
        t = t % 3600;
        const minutes = Math.trunc(t / 60);
        t = t % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${t.toString().padStart(2, '0')}`;
    }

    onDeleteClick() {
        this.deleteProject.emit();
    }
}
