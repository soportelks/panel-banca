import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getUltimaClaveRastreo(): Observable<{ nuevaClave: string }> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    return this.http.get<{ nuevaClave: string }>(`${this.apiUrl}/catalogo/ultima-clave-rastreo`, options);
  }

  getFechaOperacion(): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    const url = `${this.apiUrl}/catalogo/fecha-operacion`;
    return this.http.get<any>(url, options);
  }

  actualizarContacto(data: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    const url = `${this.apiUrl}/onboarding/update-contacto`;
    return this.http.post<any>(url, data, options);
  }

  cambiarSesion(data: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    const url = `${this.apiUrl}/onboarding/check-sesion`;
    return this.http.post<any>(url, data, options);
  }
}
