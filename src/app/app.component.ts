import {
    Component,
    signal,
    effect,
    WritableSignal,
    computed,
    EffectCleanupRegisterFn,
} from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { AddProjectFormComponent } from "./add-project-form/add-project-form.component";
import { ProjectData } from "./common/project-data";
import { ProjectItemComponent } from "./project-item/project-item.component";
import {
    CdkDropList,
    CdkDragDrop,
    CdkDrag,
    CdkDragPlaceholder,
    moveItemInArray,
} from "@angular/cdk/drag-drop";

@Component({
    selector: "app-root",
    imports: [
        RouterOutlet,
        AddProjectFormComponent,
        ProjectItemComponent,
        CdkDropList,
        CdkDrag,
        CdkDragPlaceholder,
    ],
    templateUrl: "./app.component.html",
    styleUrl: "./app.component.css",
})
export class AppComponent {
    projectList: WritableSignal<ProjectData[]>;
    runningProject: WritableSignal<ProjectItemComponent | null> = signal(null);
    projectNames = computed(() => this.projectList().map((p) => p.name));

    constructor() {
        const projectJson = localStorage.getItem("wfhProjects");
        console.log(projectJson);
        let savedObjects: { name: string; elapsedTime: number; hourlyRate?: number; }[] = [];
        try {
            savedObjects = JSON.parse(projectJson ?? "[]") as {
                name: string;
                elapsedTime: number;
                hourlyRate?: number;
            }[];
        } catch (error) {
            console.error("Error parsing localStorage data:", error);
            savedObjects = [];
        }
        const reconstructedProjects: ProjectData[] = [];
        for (var obj of savedObjects) {
            reconstructedProjects.push(
                new ProjectData(obj.name, signal(obj.elapsedTime), signal(obj.hourlyRate || 0)),
            );
        }
        this.projectList = signal(reconstructedProjects);


        // autosave
        effect(() => this.saveProjects());

        effect(() => this.onRunningProjectChanged());
    }
    title = "wfh-time-tracker";

    addProject(name: string) {
        const newProject = new ProjectData(name);
        this.projectList.update((projs) => [...projs, newProject]);
    }

    deleteProject(projectName: string) {
        this.projectList.update((projs) =>
            projs.filter((project) => project.name !== projectName),
        );
    }

    moveProject(event: CdkDragDrop<ProjectData[]>) {
        this.projectList.update((projects) => {
            const newProjects = [...projects];
            moveItemInArray(newProjects, event.previousIndex, event.currentIndex);
            return newProjects;
        });
    }

    onRunningProjectChanged() {
        this.saveProjects();
    }

    saveProjects() {
        const projsSanitized = [];
        for (var proj of this.projectList()) {
            projsSanitized.push(proj.sanitize());
        }
        const saveJson = JSON.stringify(projsSanitized);
        localStorage.setItem("wfhProjects", saveJson);
    }
}
