import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { PhotosService } from 'src/app/services/photos.service';
import { environment } from 'src/environments/environment';
import SignaturePad from 'signature_pad';
/**
 * Autor: José Alexis Martínez Bárcenas
 * Fecha: 30/05/2023
 * Descripción: Componente que guarda las fotos del cliente
 * @version 1.1
 */

@Component({
  selector: 'app-photo',
  templateUrl: './photo.page.html',
  styleUrls: ['./photo.page.scss'],
})
export class PhotoPage implements AfterViewInit {
  photosBase64: string[] = [];
  signaturePad?: SignaturePad;
  @ViewChild('canvas') canvasEl!: ElementRef;
  signatureImg?: string;
  prospectoId!: number;

  constructor(
    private photosService: PhotosService,
    private http: HttpClient,
    private router: Router,
    private alertController: AlertController
  ) {
    this.photosBase64 = this.photosService.photos;

    const navigation = this.router.getCurrentNavigation();

    if (navigation) {
      const state = navigation.extras.state;

      this.prospectoId = state?.['prospectoId'];
    }
  }

  /**
   * Metodo que se encarga de cargar el canvas cuando se carga el DOM.
   * @returns void
   */
  ngAfterViewInit() {
    if (this.canvasEl !== undefined) {
      this.signaturePad = new SignaturePad(this.canvasEl.nativeElement);
    }
  }

  /**
   * Metodo que se encarga de verificar si se toco el canvas.
   * @param event - Evento que se dispara al tocar el canvas.
   * @returns void
   */
  startDrawing(event: Event) {
    /* TODO document why this method 'startDrawing' is empty */
  }

  /**
   * Metodo que se encarga de verificar donde se mueve el cursor.
   * @param event - Evento que se dispara al mover el cursor.
   * @returns void
   */
  moved(event: Event) {
    /* TODO document why this method 'moved' is empty */
  }

  /**
   * Metodo que se encarga de limpiar el canvas
   * @returns void
   */
  clearPad() {
    if (this.signaturePad !== undefined) {
      this.signaturePad.clear();
    }
  }

  /**
   * Metodo que se encarga de guardar la firma del cliente
   * @returns void
   */
  savePad() {
    if (this.signaturePad !== undefined) {
      const base64Data = this.signaturePad.toDataURL();
      this.signatureImg = base64Data;

      this.photosBase64[0] = base64Data;
    }
  }

  /**
   * Metodo que se encarga del metodo de captura de foto
   * @param accion - Acción a realizar. 1- Tomar foto 2- Seleccionar foto de la galeria
   * @param index - Indice del arreglo.
   * @returns void
   */
  selectPhoto(accion: number, index: number) {
    if (accion === 1) {
      this.photosService.addNewPhoto(index);
    } else if (accion === 2) {
      this.photosService.photoFromStorage(index);
    }
  }

  /**
   * Metodo que guarda los documentos del cliente en la base de datos
   * @returns void
   */
  async uploadPhotos() {
    // Json de la Selfie
    const jsonSelfie = {
      datos: {
        prospectoId: this.prospectoId,
        tipoDocumentoId: 1,
        documento: this.photosBase64[1],
      },
      accion: 1,
    };

    // Json de la Ine parte frontal
    const jsonIneFrontal = {
      datos: {
        prospectoId: this.prospectoId,
        tipoDocumentoId: 2,
        documento: this.photosBase64[2],
      },
      accion: 1,
    };

    // Json de la Ine parte reverso
    const jsonIneReverso = {
      datos: {
        prospectoId: this.prospectoId,
        tipoDocumentoId: 3,
        documento: this.photosBase64[3],
      },
      accion: 1,
    };

    // Json del Comprobante de domicilio
    const jsonComprobanteDom = {
      datos: {
        prospectoId: this.prospectoId,
        tipoDocumentoId: 4,
        documento: this.photosBase64[4],
      },
      accion: 1,
    };

    // Json de la Firma
    const jsonFirma = {
      datos: {
        prospectoId: this.prospectoId,
        tipoDocumentoId: 5,
        documento: this.photosBase64[0],
      },
      accion: 1,
    };

    this.uploadPhoto(jsonSelfie);
    this.uploadPhoto(jsonIneFrontal);
    this.uploadPhoto(jsonIneReverso);
    this.uploadPhoto(jsonComprobanteDom);
    this.uploadPhoto(jsonFirma);
    this.photosBase64 = [];
  }

  uploadPhoto(json: any) {
    // Metodo post para guardar el documento en la base de datos
    this.http
      .post(environment.urlApi + '/onboarding/crud-documento-json', json)
      .subscribe(
        async (resp: any) => {
          if (resp.codigo !== '200') {
            const alert = await this.alertController.create({
              message: 'Error al subir las fotos. Intentalo de nuevo',
              buttons: ['OK'],
            });

            await alert.present();
          } else {
            this.router.navigate(['/validacion']);
            this.photosBase64 = [];
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }
}
