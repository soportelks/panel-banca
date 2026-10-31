import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SpeiService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }


  crudMovimiento(data: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    const url = `${this.apiUrl}/tesoreria/enviar-movimientos`;
    return this.http.post<any>(url, data, options);
  }

  crudMovimientoComicion(data: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    const url = `${this.apiUrl}/tesoreria/enviar-movimientos-comiciones`;
    return this.http.post<any>(url, data, options);
  }

  crudMovimientoTraspaso(data: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    const url = `${this.apiUrl}/tesoreria/enviar-movimientos-traspaso`;
    return this.http.post<any>(url, data, options);
  }

  generarEstadoCuenta(data: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    const url = `${this.apiUrl}/tesoreria/genera-estado-cuenta`;
    return this.http.post<any>(url, data, options);
  }

  crudMovimientoMasivo(data: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    const url = `${this.apiUrl}/tesoreria/enviar-movimientos-masivos`;
    return this.http.post<any>(url, data, options);
  }

  crudMovimientoMasivoComicion(data: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    const url = `${this.apiUrl}/tesoreria/enviar-movimientos-masivos-comisiones`;
    return this.http.post<any>(url, data, options);
  }


  comprobanteCorreo(data: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    const url = `${this.apiUrl}/tesoreria/enviar-email`;
    return this.http.post<any>(url, data, options);
  }

}
