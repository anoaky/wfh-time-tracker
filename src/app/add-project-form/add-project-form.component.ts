import { Component, output, input, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
@Component({
    selector: 'app-add-project-form',
    imports: [ReactiveFormsModule],
    templateUrl: './add-project-form.component.html'
})
export class AddProjectFormComponent {
    existingProjectNames = input<string[]>([]);
    newProjectName = new FormControl('', [Validators.required]);
    addProject = output<string>();
    
    private formValue = signal('');
    
    constructor() {
        // Keep signal in sync with form control
        this.newProjectName.valueChanges.subscribe(value => {
            this.formValue.set(value || '');
        });
    }
    
    isDuplicateName = computed(() => {
        const value = this.formValue().trim();
        if (!value) return false;
        return this.existingProjectNames().some(name => 
            name.toLowerCase() === value.toLowerCase()
        );
    });
    
    isValidInput = computed(() => {
        const value = this.formValue().trim();
        return value.length > 0 && !this.isDuplicateName();
    });

    onKey(event: KeyboardEvent) {
        if (event.key == "Enter" && this.isValidInput()) {
            this.onClick();
        }
    }

    onClick() {
        if (!this.isValidInput()) return;
        
        const trimmedName = this.newProjectName.value?.trim() ?? '';
        this.addProject.emit(trimmedName);
        this.newProjectName.setValue('');
    }
}
