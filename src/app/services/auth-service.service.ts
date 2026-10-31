import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  private apiUrl = environment.apiUrl + '/auth';

  constructor(private http: HttpClient) { }

  login(numero_telefono: string, contrasena: string): Observable<any> {
    const body = {
      numero_telefono,
      contrasena
    };
    return this.http.post(`${this.apiUrl}/login`, body);
  }

  logout(): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    return this.http.post(`${this.apiUrl}/logout`, {}, options);
  }

}
