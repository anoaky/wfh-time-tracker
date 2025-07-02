import {
    ComponentFixture,
    TestBed,
    fakeAsync,
    tick,
} from "@angular/core/testing";
import { ProjectItemComponent } from "./project-item.component";
import { signal } from "@angular/core";
import { By } from "@angular/platform-browser";

describe("ProjectItemComponent", () => {
    let component: ProjectItemComponent;
    let fixture: ComponentFixture<ProjectItemComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ProjectItemComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ProjectItemComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput("projectName", "Test Project");
        fixture.componentRef.setInput("runningProject", null);
        fixture.detectChanges();
    });

    afterEach(() => {
        // Clean up any running timers
        if (component["subscription"]) {
            component["subscription"].unsubscribe();
        }
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("should display project name", () => {
        const projectName = fixture.componentRef.instance.projectName;
        expect(projectName()).toEqual("Test Project");
    });

    it("should start timer when start button is clicked", fakeAsync(() => {
        expect(component.isRunning()).toBe(false);
        expect(component.elapsedTime()).toBe(0);

        const startBtn = fixture.debugElement.query(By.css(".start-btn"));
        startBtn.nativeElement.click();

        expect(component.isRunning()).toBe(true);

        tick(3000); // Simulate 3 seconds
        expect(component.elapsedTime()).toBe(3);

        component.stopTimer();
    }));

    it("should stop timer when stop button is clicked", fakeAsync(() => {
        component.startTimer();
        expect(component.isRunning()).toBe(true);

        tick(2000);
        expect(component.elapsedTime()).toBe(2);

        fixture.detectChanges();
        const stopBtn = fixture.debugElement.query(By.css(".stop-btn"));
        stopBtn.nativeElement.click();

        expect(component.isRunning()).toBe(false);

        tick(2000); // Timer should not increment
        expect(component.elapsedTime()).toBe(2);
    }));

    it("should reset timer when reset button is clicked", fakeAsync(() => {
        component.startTimer();
        tick(5000);
        expect(component.elapsedTime()).toBe(5);

        const resetBtn = fixture.debugElement.query(By.css(".reset-btn"));
        resetBtn.nativeElement.click();

        expect(component.elapsedTime()).toBe(0);
        expect(component.isRunning()).toBe(false);
    }));

    it("should format elapsed time correctly", () => {
        // Test various time values
        component.elapsedTime.set(0);
        expect(component.formatElapsedTime()).toBe("00:00:00");

        component.elapsedTime.set(59);
        expect(component.formatElapsedTime()).toBe("00:00:59");

        component.elapsedTime.set(60);
        expect(component.formatElapsedTime()).toBe("00:01:00");

        component.elapsedTime.set(3599);
        expect(component.formatElapsedTime()).toBe("00:59:59");

        component.elapsedTime.set(3600);
        expect(component.formatElapsedTime()).toBe("01:00:00");

        component.elapsedTime.set(7325); // 2h 2m 5s
        expect(component.formatElapsedTime()).toBe("02:02:05");

        component.elapsedTime.set(36000); // 10 hours
        expect(component.formatElapsedTime()).toBe("10:00:00");
    });

    it("should update elapsed time through model binding", () => {
        expect(component.elapsedTime()).toBe(0);

        // Simulate parent component updating the value
        component.elapsedTime.set(120);
        fixture.detectChanges();

        expect(component.elapsedTime()).toBe(120);
        expect(component.formatElapsedTime()).toBe("00:02:00");
    });

    it("should clean up subscription when component is destroyed", fakeAsync(() => {
        component.startTimer();
        expect(component["subscription"]).toBeTruthy();

        const subscription = component["subscription"];
        spyOn(subscription!, "unsubscribe");

        component.stopTimer();
        expect(subscription!.unsubscribe).toHaveBeenCalled();
    }));

    it("should handle multiple start/stop cycles", fakeAsync(() => {
        // First cycle
        component.startTimer();
        tick(2000);
        component.stopTimer();
        expect(component.elapsedTime()).toBe(2);

        // Second cycle
        component.startTimer();
        tick(3000);
        component.stopTimer();
        expect(component.elapsedTime()).toBe(5);

        // Third cycle
        component.startTimer();
        tick(1000);
        component.stopTimer();
        expect(component.elapsedTime()).toBe(6);
    }));

    it("should handle reset while timer is running", fakeAsync(() => {
        component.startTimer();
        tick(3000);
        expect(component.isRunning()).toBe(true);
        expect(component.elapsedTime()).toBe(3);

        component.resetTimer();
        expect(component.isRunning()).toBe(false);
        expect(component.elapsedTime()).toBe(0);

        // Ensure timer doesn't continue
        tick(2000);
        expect(component.elapsedTime()).toBe(0);
    }));

    it("should emit deleteProject event when delete button is clicked", () => {
        spyOn(component.deleteProject, "emit");

        const deleteBtn = fixture.debugElement.query(By.css(".delete-btn"));
        expect(deleteBtn).toBeTruthy();

        deleteBtn.nativeElement.click();

        expect(component.deleteProject.emit).toHaveBeenCalledWith();
    });

    it("should call onDeleteClick method when delete button is clicked", () => {
        spyOn(component, "onDeleteClick");

        const deleteBtn = fixture.debugElement.query(By.css(".delete-btn"));
        deleteBtn.nativeElement.click();

        expect(component.onDeleteClick).toHaveBeenCalled();
    });
});
