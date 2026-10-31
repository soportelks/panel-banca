import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProspectosService {

  private apiUrl = environment.apiUrl + '/onboarding';

  constructor(private http: HttpClient) { }

  postRecuperarContraseña(data: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    return this.http.post(`${this.apiUrl}/restaurar-contacto`, data, options);
  }

  postCifrarContrasena(data: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    return this.http.post(`${this.apiUrl}/cifrar-contrasena`, data, options);
  }

  postDescifrarContrasena(data: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    return this.http.post(`${this.apiUrl}/descifrar-contrasena`, data, options);
  }
}
