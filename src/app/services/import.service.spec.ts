import { TestBed } from '@angular/core/testing';
import { ImportService } from './import.service';
import { ProjectData } from '../common/project-data';

describe('ImportService', () => {
  let service: ImportService;
  let mockFileReader: any;
  let fileReaderInstance: any;

  beforeEach(() => {
    // Mock FileReader
    fileReaderInstance = {
      readAsText: jasmine.createSpy('readAsText'),
      onload: null,
      onerror: null,
      result: ''
    };
    
    mockFileReader = jasmine.createSpy('FileReader').and.returnValue(fileReaderInstance);
    (window as any).FileReader = mockFileReader;
    
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImportService);
  });

  afterEach(() => {
    // Restore original FileReader
    (window as any).FileReader = FileReader;
  });

  describe('importFromFile', () => {
    describe('JSON files', () => {
      it('should import valid JSON file with single project', async () => {
        const jsonContent = JSON.stringify([
          { name: 'Test Project', elapsedTime: 3600 }
        ]);
        const file = new File([jsonContent], 'projects.json', { type: 'application/json' });
        
        const promise = service.importFromFile(file);
        
        // Simulate FileReader loading
        fileReaderInstance.result = jsonContent;
        fileReaderInstance.onload({ target: { result: jsonContent } });
        
        const projects = await promise;
        
        expect(projects.length).toBe(1);
        expect(projects[0].name).toBe('Test Project');
        expect(projects[0].elapsedTime()).toBe(3600);
      });

      it('should import valid JSON file with multiple projects', async () => {
        const jsonContent = JSON.stringify([
          { name: 'Project 1', elapsedTime: 1000 },
          { name: 'Project 2', elapsedTime: 2000 },
          { name: 'Project 3', elapsedTime: 0 }
        ]);
        const file = new File([jsonContent], 'projects.json', { type: 'application/json' });
        
        const promise = service.importFromFile(file);
        
        fileReaderInstance.result = jsonContent;
        fileReaderInstance.onload({ target: { result: jsonContent } });
        
        const projects = await promise;
        
        expect(projects.length).toBe(3);
        expect(projects[0].name).toBe('Project 1');
        expect(projects[1].name).toBe('Project 2');
        expect(projects[2].name).toBe('Project 3');
        expect(projects[2].elapsedTime()).toBe(0);
      });

      it('should import empty JSON array', async () => {
        const jsonContent = JSON.stringify([]);
        const file = new File([jsonContent], 'empty.json', { type: 'application/json' });
        
        const promise = service.importFromFile(file);
        
        fileReaderInstance.result = jsonContent;
        fileReaderInstance.onload({ target: { result: jsonContent } });
        
        const projects = await promise;
        
        expect(projects.length).toBe(0);
      });

      it('should handle JSON file with special characters in project names', async () => {
        const jsonContent = JSON.stringify([
          { name: 'Project "with quotes"', elapsedTime: 100 },
          { name: 'Project\nwith\nnewlines', elapsedTime: 200 },
          { name: 'Project, with, commas', elapsedTime: 300 }
        ]);
        const file = new File([jsonContent], 'special.json', { type: 'application/json' });
        
        const promise = service.importFromFile(file);
        
        fileReaderInstance.result = jsonContent;
        fileReaderInstance.onload({ target: { result: jsonContent } });
        
        const projects = await promise;
        
        expect(projects[0].name).toBe('Project "with quotes"');
        expect(projects[1].name).toBe('Project\nwith\nnewlines');
        expect(projects[2].name).toBe('Project, with, commas');
      });

      it('should reject invalid JSON syntax', async () => {
        const invalidJson = '{ invalid json }';
        const file = new File([invalidJson], 'invalid.json', { type: 'application/json' });
        
        const promise = service.importFromFile(file);
        
        fileReaderInstance.result = invalidJson;
        fileReaderInstance.onload({ target: { result: invalidJson } });
        
        await expectAsync(promise).toBeRejectedWithError('Invalid JSON format. Please check your file.');
      });

      it('should reject non-array JSON', async () => {
        const jsonContent = JSON.stringify({ name: 'Project', elapsedTime: 100 });
        const file = new File([jsonContent], 'object.json', { type: 'application/json' });
        
        const promise = service.importFromFile(file);
        
        fileReaderInstance.result = jsonContent;
        fileReaderInstance.onload({ target: { result: jsonContent } });
        
        await expectAsync(promise).toBeRejectedWithError('Invalid JSON format. Expected an array of projects.');
      });

      it('should reject invalid project data - missing name', async () => {
        const jsonContent = JSON.stringify([
          { elapsedTime: 100 }
        ]);
        const file = new File([jsonContent], 'missing-name.json', { type: 'application/json' });
        
        const promise = service.importFromFile(file);
        
        fileReaderInstance.result = jsonContent;
        fileReaderInstance.onload({ target: { result: jsonContent } });
        
        await expectAsync(promise).toBeRejectedWithError(/Invalid project data/);
      });

      it('should reject invalid project data - empty name', async () => {
        const jsonContent = JSON.stringify([
          { name: '', elapsedTime: 100 }
        ]);
        const file = new File([jsonContent], 'empty-name.json', { type: 'application/json' });
        
        const promise = service.importFromFile(file);
        
        fileReaderInstance.result = jsonContent;
        fileReaderInstance.onload({ target: { result: jsonContent } });
        
        await expectAsync(promise).toBeRejectedWithError(/Invalid project data/);
      });

      it('should reject invalid project data - missing elapsedTime', async () => {
        const jsonContent = JSON.stringify([
          { name: 'Project' }
        ]);
        const file = new File([jsonContent], 'missing-time.json', { type: 'application/json' });
        
        const promise = service.importFromFile(file);
        
        fileReaderInstance.result = jsonContent;
        fileReaderInstance.onload({ target: { result: jsonContent } });
        
        await expectAsync(promise).toBeRejectedWithError(/Invalid project data/);
      });

      it('should reject negative elapsed time', async () => {
        const jsonContent = JSON.stringify([
          { name: 'Project', elapsedTime: -100 }
        ]);
        const file = new File([jsonContent], 'negative-time.json', { type: 'application/json' });
        
        const promise = service.importFromFile(file);
        
        fileReaderInstance.result = jsonContent;
        fileReaderInstance.onload({ target: { result: jsonContent } });
        
        await expectAsync(promise).toBeRejectedWithError(/Invalid project data/);
      });

      it('should reject non-integer elapsed time', async () => {
        const jsonContent = JSON.stringify([
          { name: 'Project', elapsedTime: 100.5 }
        ]);
        const file = new File([jsonContent], 'float-time.json', { type: 'application/json' });
        
        const promise = service.importFromFile(file);
        
        fileReaderInstance.result = jsonContent;
        fileReaderInstance.onload({ target: { result: jsonContent } });
        
        await expectAsync(promise).toBeRejectedWithError(/Invalid project data/);
      });

      it('should handle very large elapsed time values', async () => {
        const jsonContent = JSON.stringify([
          { name: 'Long Project', elapsedTime: 999999999 }
        ]);
        const file = new File([jsonContent], 'large-time.json', { type: 'application/json' });
        
        const promise = service.importFromFile(file);
        
        fileReaderInstance.result = jsonContent;
        fileReaderInstance.onload({ target: { result: jsonContent } });
        
        const projects = await promise;
        
        expect(projects[0].elapsedTime()).toBe(999999999);
      });

      it('should handle JSON file with BOM', async () => {
        const BOM = '\uFEFF';
        const jsonContent = BOM + JSON.stringify([
          { name: 'Project', elapsedTime: 100 }
        ]);
        const file = new File([jsonContent], 'bom.json', { type: 'application/json' });
        
        const promise = service.importFromFile(file);
        
        fileReaderInstance.result = jsonContent;
        fileReaderInstance.onload({ target: { result: jsonContent } });
        
        const projects = await promise;
        
        expect(projects.length).toBe(1);
        expect(projects[0].name).toBe('Project');
      });
    });

    describe('CSV files', () => {
      it('should import valid CSV file with single project', async () => {
        const csvContent = 'Project Name,Elapsed Time (HH:MM:SS),Elapsed Time (Seconds)\nTest Project,01:00:00,3600';
        const file = new File([csvContent], 'projects.csv', { type: 'text/csv' });
        
        const promise = service.importFromFile(file);
        
        fileReaderInstance.result = csvContent;
        fileReaderInstance.onload({ target: { result: csvContent } });
        
        const projects = await promise;
        
        expect(projects.length).toBe(1);
        expect(projects[0].name).toBe('Test Project');
        expect(projects[0].elapsedTime()).toBe(3600);
      });

      it('should import valid CSV file with multiple projects', async () => {
        const csvContent = `Project Name,Elapsed Time (HH:MM:SS),Elapsed Time (Seconds)
Project 1,00:16:40,1000
Project 2,00:33:20,2000
Project 3,00:00:00,0`;
        const file = new File([csvContent], 'projects.csv', { type: 'text/csv' });
        
        const promise = service.importFromFile(file);
        
        fileReaderInstance.result = csvContent;
        fileReaderInstance.onload({ target: { result: csvContent } });
        
        const projects = await promise;
        
        expect(projects.length).toBe(3);
        expect(projects[0].name).toBe('Project 1');
        expect(projects[1].elapsedTime()).toBe(2000);
        expect(projects[2].elapsedTime()).toBe(0);
      });

      it('should handle CSV with quoted fields containing commas', async () => {
        const csvContent = `Project Name,Elapsed Time (HH:MM:SS),Elapsed Time (Seconds)
"Project, with, commas",00:01:40,100`;
        const file = new File([csvContent], 'quoted.csv', { type: 'text/csv' });
        
        const promise = service.importFromFile(file);
        
        fileReaderInstance.result = csvContent;
        fileReaderInstance.onload({ target: { result: csvContent } });
        
        const projects = await promise;
        
        expect(projects[0].name).toBe('Project, with, commas');
      });

      it('should handle CSV with escaped quotes', async () => {
        const csvContent = `Project Name,Elapsed Time (HH:MM:SS),Elapsed Time (Seconds)
"Project ""with quotes""",00:03:20,200`;
        const file = new File([csvContent], 'quotes.csv', { type: 'text/csv' });
        
        const promise = service.importFromFile(file);
        
        fileReaderInstance.result = csvContent;
        fileReaderInstance.onload({ target: { result: csvContent } });
        
        const projects = await promise;
        
        expect(projects[0].name).toBe('Project "with quotes"');
      });

      // Note: Current implementation doesn't support newlines within quoted fields
      // This is a known limitation where CSV is split by newlines before parsing
      it('should reject CSV with quoted fields containing newlines (current limitation)', async () => {
        const csvContent = `Project Name,Elapsed Time (HH:MM:SS),Elapsed Time (Seconds)
"Project
with
newlines",00:05:00,300`;
        const file = new File([csvContent], 'newlines.csv', { type: 'text/csv' });
        
        const promise = service.importFromFile(file);
        
        fileReaderInstance.result = csvContent;
        fileReaderInstance.onload({ target: { result: csvContent } });
        
        // Current implementation treats each line as a separate row
        await expectAsync(promise).toBeRejectedWithError('Invalid CSV row at line 2: insufficient fields');
      });

      it('should parse time from HH:MM:SS format', async () => {
        const csvContent = `Project Name,Elapsed Time (HH:MM:SS),Elapsed Time (Seconds)
Project 1,25:01:01,`;
        const file = new File([csvContent], 'time-format.csv', { type: 'text/csv' });
        
        const promise = service.importFromFile(file);
        
        fileReaderInstance.result = csvContent;
        fileReaderInstance.onload({ target: { result: csvContent } });
        
        const projects = await promise;
        
        expect(projects[0].elapsedTime()).toBe(90061); // 25*3600 + 1*60 + 1
      });

      it('should use HH:MM:SS format when present, not seconds column', async () => {
        const csvContent = `Project Name,Elapsed Time (HH:MM:SS),Elapsed Time (Seconds)
Project 1,01:00:00,7200`;
        const file = new File([csvContent], 'both-formats.csv', { type: 'text/csv' });
        
        const promise = service.importFromFile(file);
        
        fileReaderInstance.result = csvContent;
        fileReaderInstance.onload({ target: { result: csvContent } });
        
        const projects = await promise;
        
        expect(projects[0].elapsedTime()).toBe(3600); // Uses HH:MM:SS format (01:00:00 = 3600 seconds)
      });

      it('should reject CSV with only header row', async () => {
        const csvContent = 'Project Name,Elapsed Time (HH:MM:SS),Elapsed Time (Seconds)';
        const file = new File([csvContent], 'header-only.csv', { type: 'text/csv' });
        
        const promise = service.importFromFile(file);
        
        fileReaderInstance.result = csvContent;
        fileReaderInstance.onload({ target: { result: csvContent } });
        
        await expectAsync(promise).toBeRejectedWithError('CSV file must have a header row and at least one data row.');
      });

      it('should reject empty CSV file', async () => {
        const csvContent = '';
        const file = new File([csvContent], 'empty.csv', { type: 'text/csv' });
        
        const promise = service.importFromFile(file);
        
        fileReaderInstance.result = csvContent;
        fileReaderInstance.onload({ target: { result: csvContent } });
        
        await expectAsync(promise).toBeRejectedWithError('CSV file must have a header row and at least one data row.');
      });

      it('should reject CSV with insufficient fields', async () => {
        const csvContent = `Project Name,Elapsed Time (HH:MM:SS),Elapsed Time (Seconds)
Project 1`;
        const file = new File([csvContent], 'insufficient.csv', { type: 'text/csv' });
        
        const promise = service.importFromFile(file);
        
        fileReaderInstance.result = csvContent;
        fileReaderInstance.onload({ target: { result: csvContent } });
        
        await expectAsync(promise).toBeRejectedWithError('Invalid CSV row at line 2: insufficient fields');
      });

      it('should reject invalid time format in CSV', async () => {
        const csvContent = `Project Name,Elapsed Time (HH:MM:SS),Elapsed Time (Seconds)
Project 1,invalid:time,`;
        const file = new File([csvContent], 'invalid-time.csv', { type: 'text/csv' });
        
        const promise = service.importFromFile(file);
        
        fileReaderInstance.result = csvContent;
        fileReaderInstance.onload({ target: { result: csvContent } });
        
        await expectAsync(promise).toBeRejectedWithError(/Invalid time format/);
      });

      it('should reject non-numeric seconds in CSV', async () => {
        const csvContent = `Project Name,Elapsed Time (HH:MM:SS),Elapsed Time (Seconds)
Project 1,,abc`;
        const file = new File([csvContent], 'non-numeric.csv', { type: 'text/csv' });
        
        const promise = service.importFromFile(file);
        
        fileReaderInstance.result = csvContent;
        fileReaderInstance.onload({ target: { result: csvContent } });
        
        await expectAsync(promise).toBeRejectedWithError('Invalid elapsed time at line 2');
      });

      it('should handle CSV file with trailing newlines', async () => {
        const csvContent = `Project Name,Elapsed Time (HH:MM:SS),Elapsed Time (Seconds)
Project 1,01:00:00,3600

`;
        const file = new File([csvContent], 'trailing.csv', { type: 'text/csv' });
        
        const promise = service.importFromFile(file);
        
        fileReaderInstance.result = csvContent;
        fileReaderInstance.onload({ target: { result: csvContent } });
        
        const projects = await promise;
        
        expect(projects.length).toBe(1);
      });

      it('should handle CSV with various time formats', async () => {
        const csvContent = `Project Name,Elapsed Time (HH:MM:SS),Elapsed Time (Seconds)
Zero time,00:00:00,
One minute,00:01:00,
One hour,01:00:00,
Complex time,12:34:56,`;
        const file = new File([csvContent], 'time-formats.csv', { type: 'text/csv' });
        
        const promise = service.importFromFile(file);
        
        fileReaderInstance.result = csvContent;
        fileReaderInstance.onload({ target: { result: csvContent } });
        
        const projects = await promise;
        
        expect(projects[0].elapsedTime()).toBe(0);
        expect(projects[1].elapsedTime()).toBe(60);
        expect(projects[2].elapsedTime()).toBe(3600);
        expect(projects[3].elapsedTime()).toBe(45296); // 12*3600 + 34*60 + 56
      });
    });

    describe('File type detection', () => {
      it('should detect JSON file by extension when type is missing', async () => {
        const jsonContent = JSON.stringify([{ name: 'Test', elapsedTime: 100 }]);
        const file = new File([jsonContent], 'projects.json', { type: '' });
        
        const promise = service.importFromFile(file);
        
        fileReaderInstance.result = jsonContent;
        fileReaderInstance.onload({ target: { result: jsonContent } });
        
        const projects = await promise;
        
        expect(projects.length).toBe(1);
      });

      it('should detect CSV file by extension when type is missing', async () => {
        const csvContent = `Project Name,Elapsed Time (HH:MM:SS),Elapsed Time (Seconds)
Test,00:01:40,100`;
        const file = new File([csvContent], 'projects.csv', { type: '' });
        
        const promise = service.importFromFile(file);
        
        fileReaderInstance.result = csvContent;
        fileReaderInstance.onload({ target: { result: csvContent } });
        
        const projects = await promise;
        
        expect(projects.length).toBe(1);
      });

      it('should reject unsupported file format', async () => {
        const content = 'Some text content';
        const file = new File([content], 'projects.txt', { type: 'text/plain' });
        
        const promise = service.importFromFile(file);
        
        fileReaderInstance.result = content;
        fileReaderInstance.onload({ target: { result: content } });
        
        await expectAsync(promise).toBeRejectedWithError('Unsupported file format. Please upload a JSON or CSV file.');
      });

      it('should handle file with wrong extension vs content', async () => {
        // JSON content with .csv extension
        const jsonContent = JSON.stringify([{ name: 'Test', elapsedTime: 100 }]);
        const file = new File([jsonContent], 'projects.csv', { type: 'text/csv' });
        
        const promise = service.importFromFile(file);
        
        fileReaderInstance.result = jsonContent;
        fileReaderInstance.onload({ target: { result: jsonContent } });
        
        // Should fail as CSV parser
        await expectAsync(promise).toBeRejectedWithError('CSV file must have a header row and at least one data row.');
      });
    });

    describe('FileReader errors', () => {
      it('should handle FileReader errors', async () => {
        const file = new File(['content'], 'projects.json', { type: 'application/json' });
        
        const promise = service.importFromFile(file);
        
        // Simulate FileReader error
        fileReaderInstance.onerror();
        
        await expectAsync(promise).toBeRejectedWithError('Failed to read file');
      });
    });

    describe('Memory and performance considerations', () => {
      it('should handle large number of projects', async () => {
        const projects = Array.from({ length: 1000 }, (_, i) => ({
          name: `Project ${i}`,
          elapsedTime: i * 100
        }));
        const jsonContent = JSON.stringify(projects);
        const file = new File([jsonContent], 'large.json', { type: 'application/json' });
        
        const promise = service.importFromFile(file);
        
        fileReaderInstance.result = jsonContent;
        fileReaderInstance.onload({ target: { result: jsonContent } });
        
        const imported = await promise;
        
        expect(imported.length).toBe(1000);
        expect(imported[999].name).toBe('Project 999');
      });
    });
  });
});