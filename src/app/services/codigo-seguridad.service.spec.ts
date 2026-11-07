import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CodigoSeguridadService } from './codigo-seguridad.service';
import { environment } from 'src/environments/environment';

describe('CodigoSeguridadService', () => {
  let service: CodigoSeguridadService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CodigoSeguridadService]
    });
    service = TestBed.inject(CodigoSeguridadService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crearse correctamente el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debe solicitar codigo enviando POST a /seguridad/codigo/solicitar', () => {
    const mockResponse = {
      codigo: 0,
      mensaje: 'Código de seguridad enviado exitosamente',
      destinatarioEnmascarado: 'c***o@dominio.com',
      tipoTransaccion: 'TRANSFERENCIA_SPEI',
      expiracionSegundos: 120,
      tokenSolicitud: 'token-uuid-123'
    };

    service.solicitarCodigo('TRANSFERENCIA_SPEI').subscribe(res => {
      expect(res.codigo).toBe(0);
      expect(res.destinatarioEnmascarado).toBe('c***o@dominio.com');
      expect(res.tokenSolicitud).toBe('token-uuid-123');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/seguridad/codigo/solicitar`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ tipoTransaccion: 'TRANSFERENCIA_SPEI', correoAlternativo: undefined });
    req.flush(mockResponse);
  });

  it('debe validar codigo enviando POST a /seguridad/codigo/validar', () => {
    const mockResponse = {
      codigo: 0,
      valido: true,
      mensaje: 'Código validado exitosamente',
      tokenAutorizacion: 'auth-token-456',
      intentosRestantes: 3
    };

    service.validarCodigo('123456', 'TRANSFERENCIA_SPEI', 'token-uuid-123').subscribe(res => {
      expect(res.valido).toBeTrue();
      expect(res.tokenAutorizacion).toBe('auth-token-456');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/seguridad/codigo/validar`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      tipoTransaccion: 'TRANSFERENCIA_SPEI',
      codigoSeguridad: '123456',
      tokenSolicitud: 'token-uuid-123'
    });
    req.flush(mockResponse);
  });
});

