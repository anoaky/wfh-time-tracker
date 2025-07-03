import { CdkDragHandle } from "@angular/cdk/drag-drop";
import { Component, input, model, signal, output, effect, computed, ViewChild, ElementRef } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { interval, Subscription } from "rxjs";

@Component({
    selector: "project-item",
    imports: [FormsModule, ReactiveFormsModule, CdkDragHandle],
    templateUrl: "./project-item.component.html",
})
export class ProjectItemComponent {
    projectName = input.required<string>();
    runningProject = model.required<ProjectItemComponent | null>();
    elapsedTime = model(0); // in seconds
    hourlyRate = model(0); // hourly rate in currency units
    isRunning = signal(false);
    startTime: number | null = null;
    deleteProject = output<void>();
    isEditingRate = signal(false);
    @ViewChild('rateInput') rateInput!: ElementRef<HTMLInputElement>;
    private subscription: Subscription | null = null;

    constructor() {
        effect(() => {
            if (this.isEditingRate() && this.rateInput) {
                setTimeout(() => {
                    this.rateInput.nativeElement.focus();
                    this.rateInput.nativeElement.select();
                }, 0);
            }
        });
    }

    // Computed property for earnings
    earnings = computed(() => {
        const hours = this.elapsedTime() / 3600; // convert seconds to hours
        return hours * this.hourlyRate();
    });

    startTimer() {
        this.runningProject()?.stopTimer();
        this.startTime = Date.now() - (this.elapsedTime() * 1000);
        this.subscription = interval(1000).subscribe(() => {
            const currentTime = Date.now();
            this.elapsedTime.set(Math.round((currentTime - this.startTime!) / 1000));
        });
        this.isRunning.set(true);
        this.runningProject.set(this);
    }

    stopTimer() {
        this.subscription?.unsubscribe();
        this.isRunning.set(false);
        this.startTime = null;
    }

    resetTimer() {
        this.stopTimer();
        this.elapsedTime.set(0);
    }

    timerStyle(): string {
        const common =
            "text-3xl font-mono font-bold px-6 py-3 rounded-xl border-2 transition-all duration-300 shadow-sm";
        if (this.isRunning()) {
            return `${common} text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-600 animate-pulse-gentle shadow-green-200/50 dark:shadow-green-900/30`;
        } else if (this.elapsedTime() == 0) {
            return `${common} text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/30 border-slate-300 dark:border-slate-600`;
        } else {
            return `${common} text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 border-orange-300 dark:border-orange-600`;
        }
    }

    formatEarnings(): string {
        return this.earnings().toFixed(2);
    }

    formatHourlyRate(): string {
        return this.hourlyRate().toFixed(2);
    }

    startEditingRate() {
        setTimeout(() => this.rateInput.nativeElement.select(), 25);
        this.isEditingRate.set(true);
    }

    stopEditingRate() {
        this.isEditingRate.set(false);
        if (this.hourlyRate() < 0) {
            this.hourlyRate.set(0);
        }
    }

    formatElapsedTime(): string {
        let t = this.elapsedTime();
        const hours = Math.trunc(t / 3600);
        t = t % 3600;
        const minutes = Math.trunc(t / 60);
        t = t % 60;
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${t.toString().padStart(2, "0")}`;
    }

    onDeleteClick() {
        this.deleteProject.emit();
    }
}
