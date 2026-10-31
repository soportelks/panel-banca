import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransaccionesService {

  private apiUrl = environment.apiUrl + '/transaccion';

  constructor(private http: HttpClient) { }

  getGeneralesCategorias(data: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    return this.http.post(`${this.apiUrl}/inversion`, data, options);
  }

  ventasMTC(data: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    return this.http.post(`${this.apiUrl}/venta-mtc`, data, options);
  }
}
