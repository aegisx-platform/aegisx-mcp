import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AxBarcodeScannerComponent } from './ax-barcode-scanner.component';

describe('AxBarcodeScannerComponent', () => {
  let component: AxBarcodeScannerComponent;
  let fixture: ComponentFixture<AxBarcodeScannerComponent>;

  beforeEach(async () => {
    // Mock navigator.mediaDevices
    const mockMediaDevices = {
      getUserMedia: () => Promise.reject(new Error('Camera not available')),
    };

    Object.defineProperty(window.navigator, 'mediaDevices', {
      writable: true,
      configurable: true,
      value: mockMediaDevices,
    });

    await TestBed.configureTestingModule({
      imports: [AxBarcodeScannerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AxBarcodeScannerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default mode as auto', () => {
    expect(component.mode()).toBe('auto');
  });

  it('should have default formats', () => {
    const formats = component.formats();
    expect(formats).toEqual(['qr', 'ean13', 'code128']);
  });

  it('should have beepSound enabled by default', () => {
    expect(component.beepSound()).toBe(true);
  });

  it('should have continuousScan disabled by default', () => {
    expect(component.continuousScan()).toBe(false);
  });

  it('should have showHistory disabled by default', () => {
    expect(component.showHistory()).toBe(false);
  });

  it('should have default placeholder text', () => {
    expect(component.placeholder()).toBe('Enter barcode...');
  });

  it('should respond to mode input', () => {
    fixture.componentRef.setInput('mode', 'manual');
    fixture.detectChanges();
    expect(component.mode()).toBe('manual');
  });

  it('should respond to formats input', () => {
    fixture.componentRef.setInput('formats', ['ean13']);
    fixture.detectChanges();
    expect(component.formats()).toEqual(['ean13']);
  });

  it('should respond to beepSound input', () => {
    fixture.componentRef.setInput('beepSound', false);
    fixture.detectChanges();
    expect(component.beepSound()).toBe(false);
  });

  it('should respond to continuousScan input', () => {
    fixture.componentRef.setInput('continuousScan', true);
    fixture.detectChanges();
    expect(component.continuousScan()).toBe(true);
  });

  it('should respond to showHistory input', () => {
    fixture.componentRef.setInput('showHistory', true);
    fixture.detectChanges();
    expect(component.showHistory()).toBe(true);
  });

  it('should respond to placeholder input', () => {
    fixture.componentRef.setInput('placeholder', 'Scan barcode');
    fixture.detectChanges();
    expect(component.placeholder()).toBe('Scan barcode');
  });

  it('should have onScan output', () => {
    expect(component.onScan).toBeDefined();
  });

  it('should have onError output', () => {
    expect(component.onError).toBeDefined();
  });

  it('should have onModeChange output', () => {
    expect(component.onModeChange).toBeDefined();
  });

  it('should initialize component without errors', () => {
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should have switchToManualMode method', () => {
    expect(component.switchToManualMode).toBeDefined();
    expect(typeof component.switchToManualMode).toBe('function');
  });
});
