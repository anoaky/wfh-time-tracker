import { TestBed } from '@angular/core/testing';
import { ExportService } from './export.service';
import { ProjectData } from '../common/project-data';
import { signal } from '@angular/core';

describe('ExportService', () => {
  let service: ExportService;
  let mockURL: any;
  let mockLink: any;

  beforeEach(() => {
    // Mock URL methods
    mockURL = {
      createObjectURL: jasmine.createSpy('createObjectURL').and.returnValue('blob:mock-url'),
      revokeObjectURL: jasmine.createSpy('revokeObjectURL')
    };
    
    // Mock link element
    mockLink = {
      href: '',
      download: '',
      click: jasmine.createSpy('click')
    };
    
    // Apply mocks to global objects
    (window as any).URL = mockURL;
    spyOn(document, 'createElement').and.returnValue(mockLink);
    
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportService);
  });

  afterEach(() => {
    // Restore original global objects
    (window as any).URL = URL;
  });

  describe('exportAsJSON', () => {
    it('should export empty project list as JSON', () => {
      const projects: ProjectData[] = [];
      
      service.exportAsJSON(projects);
      
      // Verify Blob creation
      expect(mockURL.createObjectURL).toHaveBeenCalledWith(jasmine.any(Blob));
      const blobCall = mockURL.createObjectURL.calls.mostRecent();
      const blob = blobCall.args[0];
      expect(blob.type).toBe('application/json');
      
      // Verify download link
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.href).toBe('blob:mock-url');
      expect(mockLink.download).toMatch(/^wfh-projects-\d{4}-\d{2}-\d{2}\.json$/);
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockURL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should export single project as JSON', () => {
      const projects = [
        new ProjectData('Test Project', signal(3661))
      ];
      
      service.exportAsJSON(projects);
      
      // Verify Blob creation
      expect(mockURL.createObjectURL).toHaveBeenCalledWith(jasmine.any(Blob));
      const blobCall = mockURL.createObjectURL.calls.mostRecent();
      const blob = blobCall.args[0];
      expect(blob.type).toBe('application/json');
      expect(blob.size).toBeGreaterThan(0);
    });

    it('should export multiple projects as JSON with proper formatting', () => {
      const projects = [
        new ProjectData('Project 1', signal(3600)),
        new ProjectData('Project 2', signal(7200)),
        new ProjectData('Project 3', signal(0))
      ];
      
      service.exportAsJSON(projects);
      
      // Verify multiple projects are handled
      expect(mockURL.createObjectURL).toHaveBeenCalledWith(jasmine.any(Blob));
      const blobCall = mockURL.createObjectURL.calls.mostRecent();
      const blob = blobCall.args[0];
      expect(blob.type).toBe('application/json');
      // Should be larger than single project
      expect(blob.size).toBeGreaterThan(50);
    });

    it('should handle projects with special characters in names', () => {
      const projects = [
        new ProjectData('Project "with quotes"', signal(100)),
        new ProjectData('Project\nwith\nnewlines', signal(200)),
        new ProjectData('Project, with, commas', signal(300))
      ];
      
      service.exportAsJSON(projects);
      
      // Verify special characters are handled
      expect(mockURL.createObjectURL).toHaveBeenCalledWith(jasmine.any(Blob));
      const blobCall = mockURL.createObjectURL.calls.mostRecent();
      const blob = blobCall.args[0];
      expect(blob.type).toBe('application/json');
    });

    it('should handle very large elapsed time values', () => {
      const projects = [
        new ProjectData('Long Running Project', signal(999999999))
      ];
      
      service.exportAsJSON(projects);
      
      // Verify large values are handled
      expect(mockURL.createObjectURL).toHaveBeenCalledWith(jasmine.any(Blob));
      const blobCall = mockURL.createObjectURL.calls.mostRecent();
      const blob = blobCall.args[0];
      expect(blob.type).toBe('application/json');
    });
  });

  describe('exportAsCSV', () => {
    it('should export empty project list as CSV with headers only', () => {
      const projects: ProjectData[] = [];
      
      service.exportAsCSV(projects);
      
      const blobCall = mockURL.createObjectURL.calls.mostRecent();
      const blob = blobCall.args[0];
      expect(blob.type).toBe('text/csv');
      // Should have header row only
      expect(blob.size).toBeGreaterThan(0);
      expect(blob.size).toBeLessThan(100);
    });

    it('should export single project as CSV', () => {
      const projects = [
        new ProjectData('Test Project', signal(3661))
      ];
      
      service.exportAsCSV(projects);
      
      const blobCall = mockURL.createObjectURL.calls.mostRecent();
      const blob = blobCall.args[0];
      expect(blob.type).toBe('text/csv');
      // Should have header + 1 data row
      expect(blob.size).toBeGreaterThan(50);
    });

    it('should export multiple projects as CSV', () => {
      const projects = [
        new ProjectData('Project 1', signal(3600)),
        new ProjectData('Project 2', signal(7200)),
        new ProjectData('Project 3', signal(0))
      ];
      
      service.exportAsCSV(projects);
      
      const blobCall = mockURL.createObjectURL.calls.mostRecent();
      const blob = blobCall.args[0];
      expect(blob.type).toBe('text/csv');
      // Should be larger with multiple projects
      expect(blob.size).toBeGreaterThan(100);
    });

    it('should properly escape CSV fields with commas', () => {
      const projects = [
        new ProjectData('Project, with, commas', signal(100))
      ];
      
      service.exportAsCSV(projects);
      
      // Test that private method properly escapes
      const escapedField = (service as any).escapeCsvField('Project, with, commas');
      expect(escapedField).toBe('"Project, with, commas"');
    });

    it('should properly escape CSV fields with quotes', () => {
      const projects = [
        new ProjectData('Project "with quotes"', signal(200))
      ];
      
      service.exportAsCSV(projects);
      
      // Test that private method properly escapes
      const escapedField = (service as any).escapeCsvField('Project "with quotes"');
      expect(escapedField).toBe('"Project ""with quotes"""');
    });

    it('should properly escape CSV fields with newlines', () => {
      const projects = [
        new ProjectData('Project\nwith\nnewlines', signal(300))
      ];
      
      service.exportAsCSV(projects);
      
      // Test that private method properly escapes
      const escapedField = (service as any).escapeCsvField('Project\nwith\nnewlines');
      expect(escapedField).toBe('"Project\nwith\nnewlines"');
    });

    it('should handle very large elapsed time values', () => {
      const projects = [
        new ProjectData('Long Project', signal(999999))
      ];
      
      service.exportAsCSV(projects);
      
      // Test that formatTime handles large values
      const formattedTime = (service as any).formatTime(999999);
      expect(formattedTime).toBe('277:46:39');
    });

    it('should format time correctly for various values', () => {
      const testCases = [
        { seconds: 0, expected: '00:00:00' },
        { seconds: 59, expected: '00:00:59' },
        { seconds: 60, expected: '00:01:00' },
        { seconds: 3599, expected: '00:59:59' },
        { seconds: 3600, expected: '01:00:00' },
        { seconds: 3661, expected: '01:01:01' },
        { seconds: 86399, expected: '23:59:59' },
        { seconds: 86400, expected: '24:00:00' },
        { seconds: 90061, expected: '25:01:01' }
      ];
      
      // Test synchronously without FileReader
      testCases.forEach(({ seconds, expected }) => {
        const projects = [
          new ProjectData(`Test ${seconds}s`, signal(seconds))
        ];
        
        // Call private formatTime method directly through service
        const formatTime = (service as any).formatTime(seconds);
        expect(formatTime).toBe(expected);
      });
    });
  });

  describe('private methods', () => {
    it('should generate correct date string', () => {
      // Mock Date to return a specific date
      const mockDate = new Date('2023-12-25T10:30:00Z');
      jasmine.clock().install();
      jasmine.clock().mockDate(mockDate);
      
      const projects: ProjectData[] = [];
      service.exportAsJSON(projects);
      
      expect(mockLink.download).toBe('wfh-projects-2023-12-25.json');
      
      jasmine.clock().uninstall();
    });

    it('should handle download file functionality correctly', () => {
      const projects = [
        new ProjectData('Test', signal(100))
      ];
      
      service.exportAsJSON(projects);
      
      // Verify the complete download flow
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.href).toBe('blob:mock-url');
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockURL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });
  });
});