import { Component, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportService } from '../../services/export.service';
import { ProjectData } from '../../common/project-data';

@Component({
  selector: 'app-export-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      (click)="exportData()"
      [disabled]="isExporting() || !hasData()"
      class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
      [attr.aria-label]="'Export data as ' + format()"
      type="button">
      <span>Export {{ format() === 'csv' ? 'CSV' : 'JSON' }}</span>
      <svg *ngIf="!isExporting()" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
      </svg>
      <svg *ngIf="isExporting()" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </button>
    
    <div *ngIf="showNotification()" 
         class="fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white transition-opacity duration-300"
         [class.bg-green-600]="notificationType() === 'success'"
         [class.bg-red-600]="notificationType() === 'error'"
         role="alert">
      {{ notificationMessage() }}
    </div>
  `,
  styles: []
})
export class ExportButtonComponent {
  private exportService = inject(ExportService);
  
  projects = input.required<ProjectData[]>();
  format = input<'csv' | 'json'>('csv');
  
  isExporting = signal(false);
  showNotification = signal(false);
  notificationMessage = signal('');
  notificationType = signal<'success' | 'error'>('success');
  
  hasData(): boolean {
    return this.projects().length > 0;
  }
  
  async exportData(): Promise<void> {
    if (!this.hasData() || this.isExporting()) {
      return;
    }
    
    this.isExporting.set(true);
    
    try {
      if (this.format() === 'csv') {
        this.exportService.exportAsCSV(this.projects());
      } else {
        this.exportService.exportAsJSON(this.projects());
      }
      
      this.showSuccessNotification(`Data exported successfully as ${this.format().toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      this.showErrorNotification('Failed to export data. Please try again.');
    } finally {
      this.isExporting.set(false);
    }
  }
  
  private showSuccessNotification(message: string): void {
    this.notificationMessage.set(message);
    this.notificationType.set('success');
    this.showNotification.set(true);
    this.hideNotificationAfterDelay();
  }
  
  private showErrorNotification(message: string): void {
    this.notificationMessage.set(message);
    this.notificationType.set('error');
    this.showNotification.set(true);
    this.hideNotificationAfterDelay();
  }
  
  private hideNotificationAfterDelay(): void {
    setTimeout(() => {
      this.showNotification.set(false);
    }, 3000);
  }
}