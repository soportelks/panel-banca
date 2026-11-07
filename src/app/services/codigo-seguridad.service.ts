import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface SolicitudCodigoSeguridad {
  tipoTransaccion?: string;
  correoAlternativo?: string;
}

export interface RespuestaCodigoSeguridad {
  codigo: number;
  mensaje: string;
  destinatarioEnmascarado?: string;
  tipoTransaccion?: string;
  expiracionSegundos?: number;
  tokenSolicitud?: string;
}

export interface SolicitudValidarCodigo {
  tipoTransaccion?: string;
  codigoSeguridad: string;
  tokenSolicitud?: string;
}

export interface RespuestaValidarCodigo {
  codigo: number;
  valido: boolean;
  mensaje: string;
  tokenAutorizacion?: string;
  intentosRestantes?: number;
}

/**
 * Servicio Angular para la gestión segura de códigos de verificación transaccionales.
 * Totalmente desacoplado de los servicios OTP previos para preservar la estabilidad de login y dispersiones.
 */
@Injectable({
  providedIn: 'root'
})
export class CodigoSeguridadService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private getOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + (localStorage.getItem('token') || '')
      })
    };
  }

  /**
   * Solicita el envío de un código de seguridad para autorizar una transacción financiera.
   *
   * @param tipoTransaccion Tipo de transacción bancaria (e.g. 'TRANSFERENCIA_SPEI', 'TRASPASO')
   * @param correoAlternativo Correo opcional en caso de override
   */
  solicitarCodigo(tipoTransaccion: string = 'TRANSFERENCIA_SPEI', correoAlternativo?: string): Observable<RespuestaCodigoSeguridad> {
    const payload: SolicitudCodigoSeguridad = {
      tipoTransaccion,
      correoAlternativo
    };
    return this.http.post<RespuestaCodigoSeguridad>(
      `${this.apiUrl}/seguridad/codigo/solicitar`,
      payload,
      this.getOptions()
    );
  }

  /**
   * Valida el código de seguridad de manera atómica en el backend.
   * Si es exitoso, devuelve el tokenAutorizacion único para proceder con la transacción.
   *
   * @param codigoSeguridad Código numérico ingresado por el cliente
   * @param tipoTransaccion Tipo de transacción asociada
   * @param tokenSolicitud Token de sesión/solicitud emitido al generar el código
   */
  validarCodigo(codigoSeguridad: string, tipoTransaccion: string = 'TRANSFERENCIA_SPEI', tokenSolicitud?: string): Observable<RespuestaValidarCodigo> {
    const payload: SolicitudValidarCodigo = {
      tipoTransaccion,
      codigoSeguridad: `${codigoSeguridad}`.trim(),
      tokenSolicitud
    };
    return this.http.post<RespuestaValidarCodigo>(
      `${this.apiUrl}/seguridad/codigo/validar`,
      payload,
      this.getOptions()
    );
  }

  /**
   * Verifica la vigencia de un token de autorización expedido previamente.
   */
  verificarToken(tokenAutorizacion: string, tipoTransaccion: string = 'TRANSFERENCIA_SPEI'): Observable<{ valido: boolean; mensaje: string }> {
    return this.http.post<{ valido: boolean; mensaje: string }>(
      `${this.apiUrl}/seguridad/codigo/verificar-token`,
      { tipoTransaccion, tokenAutorizacion },
      this.getOptions()
    );
  }
}
