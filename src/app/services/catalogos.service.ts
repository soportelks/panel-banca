import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CatalogosService {

  private apiUrl = environment.apiUrl + '/catalogo';

  constructor(private http: HttpClient) { }

  getGeneralesCategorias(data: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    return this.http.post(`${this.apiUrl}/get-generales-categoria`, data, options);
  }

  getServicios(data: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    return this.http.post(`${this.apiUrl}/get-productos-servicios`, data, options);
  }

  getEstados(data: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    let options = { headers: headers };
    return this.http.post(`${this.apiUrl}/get-estados`, data, options);
  }
}
