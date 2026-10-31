import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DispersionesMasivasService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
  * Función para insertar dispersiones masivas
  * @param data Datos del filtrado
  * @returns Observable<any>
  */
  enviarDispersionesMasivas(data: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    const url = `${this.apiUrl}/tesoreria/insertar-dispersiones-masivo`;
    return this.http.post<any>(url, data, options);
  }


  spsOrdenes(data: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    const url = `${this.apiUrl}/tesoreria/get-info-movimiento"`;
    return this.http.post<any>(url, data, options);
  }

  spsClaveCliente(data: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    const url = `${this.apiUrl}/tesoreria/get-clave-cliente"`;
    return this.http.post<any>(url, data, options);
  }

  consultarSaldos(): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    const url = `${this.apiUrl}/tesoreria/saldo`;
    return this.http.get<any>(url, options);
  }

  consultarFirma(data: any): Observable<string> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    const url = `${this.apiUrl}/tesoreria/sign`;
    return this.http.post(url, data, { ...options, responseType: 'text' });
  }


  envioPagosMasivos(data: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    const url = `${this.apiUrl}/tesoreria/registrar-spei-masivos`;
    return this.http.post<any>(url, data, options);
  }

  envioPagos(data: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    const url = `${this.apiUrl}/tesoreria/registrar-spei`;
    return this.http.post<any>(url, data, options);
  }

  descargarComprobante(data: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    const url = `${this.apiUrl}/tesoreria/comprobante-pagos`;
    return this.http.post<any>(url, data, options);
  }

}
