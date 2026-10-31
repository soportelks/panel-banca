import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OtpServiceService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  sendOtp(email: string) {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });

    let options = { headers: headers };

    // Enviamos el correo como un objeto JSON en el cuerpo de la solicitud
    return this.http.post(`${this.apiUrl}/otp/send`, { email }, options);
  }

  verifyOtp(email: string, code: number) {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });

    let options = { headers: headers };

    // Enviamos el correo y el código como un objeto JSON en el cuerpo de la solicitud
    return this.http.post<boolean>(`${this.apiUrl}/otp/verify`, { email, code }, options);
  }


}
