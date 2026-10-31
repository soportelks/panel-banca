import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

/**
 * Autor: José Alexis Martínez Bárcenas
 * Fecha: 28/05/2023
 * Descripción: Servicio que guarda las fotos en Base 64
 */

@Injectable({
  providedIn: 'root',
})
export class PhotosService {
  photos: string[] = [];

  /**
   * Metodo que guarda las fotos en Base 64 en un arreglo de fotos
   * @param index - Indice del arreglo de fotos en Base64
   * @returns void
   */
  async addNewPhoto(index: number) {
    // Llamamos a la libreria de camara para tomar una foto
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      quality: 90,
    });

    // Guardamos la foto en el arreglo de fotos
    if (photo.base64String) {
      this.photos[index] = photo.base64String;
    }
  }

  async photoFromStorage(index: number) {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos,
      quality: 90,
    });

    // Guardamos la foto en el arreglo de fotos
    if (photo.base64String) {
      this.photos[index] = photo.base64String;
    }
  }
}
