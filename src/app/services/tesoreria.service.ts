import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TesoreriaService {

  private apiUrl = environment.apiUrl + '/tesoreria';

  constructor(private http: HttpClient) { }

  saldoCliente(data: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    return this.http.post(`${this.apiUrl}/get-saldo-ahorro`, data, options);
  }

  saldoClienteValidacion(data: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    return this.http.post(`${this.apiUrl}/validar-saldo-ahorro`, data, options);
  }

  getClaveCliente(data: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    return this.http.post(`${this.apiUrl}/get-clave-cliente`, data, options);
  }

  getMMovimientos(data: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    return this.http.post(`${this.apiUrl}/get-mov-historico-cliente`, data, options);
  }

  getInfoMovimientos(data: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    return this.http.post(`${this.apiUrl}/get-info-movimiento`, data, options);
  }

  comprobantePagos(data: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    return this.http.post(`${this.apiUrl}/comprobante-pagos`, data, options);
  }

  getTipoInversion(data: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    return this.http.post(`${this.apiUrl}/get-montos-inversion`, data, options);
  }

  calcularInverciones(data: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    return this.http.post(`${this.apiUrl}/calcular-inversiones`, data, options);
  }

  calcularPagos(data: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    return this.http.post(`${this.apiUrl}/get-pagos`, data, options);
  }

  getCreditos(data: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    return this.http.post(`${this.apiUrl}/get-creditos-clientes`, data, options);
  }

  getInverciones(data: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    return this.http.post(`${this.apiUrl}/get-inversiones-cliente`, data, options);
  }

  getRecargasMonto(data: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    return this.http.post(`${this.apiUrl}/get-recargas-montos`, data, options);
  }

  getDatosComiciones(data: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    return this.http.post(`${this.apiUrl}/comiciones-cliente`, data, options);
  }





}
