import { Component, input, signal, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportService } from '../export.service';

@Component({
  selector: 'app-export-button',
  imports: [CommonModule],
  templateUrl: './export-button.component.html',
  styleUrl: './export-button.component.css'
})
export class ExportButtonComponent {
  projects = input.required<{ name: string, elapsedTime: number }[]>();
  
  private exportService = inject(ExportService);
  
  // State management using Angular signals
  isDropdownOpen = signal(false);
  isExporting = signal(false);
  exportError = signal<string | null>(null);
  exportSuccess = signal(false);
  
  // Toggle dropdown visibility
  toggleDropdown() {
    this.isDropdownOpen.update(open => !open);
    this.clearMessages();
  }
  
  // Close dropdown
  closeDropdown() {
    this.isDropdownOpen.set(false);
  }
  
  // Clear success/error messages
  private clearMessages() {
    this.exportError.set(null);
    this.exportSuccess.set(false);
  }
  
  // Handle CSV export
  async exportCSV() {
    await this.performExport(() => this.exportService.exportToCSV(this.projects()));
  }
  
  // Handle JSON export  
  async exportJSON() {
    await this.performExport(() => this.exportService.exportToJSON(this.projects()));
  }
  
  // Generic export handler with loading states and error handling
  private async performExport(exportFn: () => void) {
    this.clearMessages();
    this.isExporting.set(true);
    this.closeDropdown();
    
    try {
      exportFn();
      this.exportSuccess.set(true);
      // Auto-dismiss success message after 3 seconds
      setTimeout(() => this.exportSuccess.set(false), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      this.exportError.set(errorMessage);
      // Auto-dismiss error message after 5 seconds
      setTimeout(() => this.exportError.set(null), 5000);
    } finally {
      this.isExporting.set(false);
    }
  }
  
  // Handle keyboard events for accessibility
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeDropdown();
    } else if (event.key === 'Enter' && !this.isDropdownOpen()) {
      this.toggleDropdown();
    }
  }
  
  // Handle CSV export with keyboard
  onCSVKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.exportCSV();
    }
  }
  
  // Handle JSON export with keyboard
  onJSONKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.exportJSON();
    }
  }
  
  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as Element;
    if (!target.closest('.export-dropdown')) {
      this.closeDropdown();
    }
  }
}