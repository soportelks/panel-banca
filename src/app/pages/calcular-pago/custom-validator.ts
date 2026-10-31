import { FormControl } from '@angular/forms';

export class CustomValidator {
  static isValidDate(control: FormControl): { [key: string]: boolean } | null {
    if (control.value !== null) {
      // Obtener los límites de fecha
      const fechaActual = new Date();
      const fechaMaxima = new Date(fechaActual.getFullYear()+30, 11);
      
      // Dividir la fecha en mes y año de la fecha ingresada
      const fechaIngresadaSF = control.value;
      const [mesFecha, anioFecha] = fechaIngresadaSF.split('/').map(Number);
      
      // Obtiene los dos primeros dígitos del año actual
      const anioActual = Math.floor(fechaActual.getFullYear() / 100);
      const anioIngresado = parseInt(String(anioActual) + String(anioFecha)); // Se guarda el año ingresado en formato correcto
      const fechaIngresada = new Date(anioIngresado, mesFecha - 1);
      
      if (fechaIngresada < fechaActual) {
        //console.log("La " + fechaIngresadaSF + " es menor que el límite mínimo: "+fechaLimiteMinimo);
        return { invalidValue: true };
      } else if (fechaIngresada > fechaMaxima) {
        //console.log("La " + fechaIngresadaSF + " es mayor que el límite máximo: "+fechaLimiteMaximo);
        return { invalidValue: true };
      } else {
        //console.log("La " + fechaIngresadaSF + " está dentro del rango permitido: "+fechaLimiteMinimo+" - "+fechaLimiteMaximo);
      }
    }
    return null;
  }

  static sinEspaciosEnBlanco(control: FormControl): { [key: string]: boolean } | null {

    if(control.value !== null) {
      if (control.value.trim() === '' || control.value.trim().length === 0) {
        return { sinEspaciosEnBlanco: true };
      }
    }
    return null;
  }

}

