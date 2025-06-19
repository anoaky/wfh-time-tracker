import { Component, input, model, signal, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { interval, Subscription } from 'rxjs';

@Component({
    selector: 'project-item',
    imports: [ReactiveFormsModule, CdkDrag],
    templateUrl: './project-item.component.html'
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
        const common = "text-3xl font-mono font-bold px-6 py-3 rounded-xl border-2 transition-all duration-300 shadow-sm";
        if (this.isRunning()) {
            return `${common} text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-600 animate-pulse-gentle shadow-green-200/50 dark:shadow-green-900/30`;
        } else if (this.elapsedTime() == 0) {
            return `${common} text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/30 border-slate-300 dark:border-slate-600`;
        } else {
            return `${common} text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 border-orange-300 dark:border-orange-600`;
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
