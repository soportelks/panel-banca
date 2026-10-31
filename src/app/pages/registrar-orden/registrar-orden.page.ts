import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component } from '@angular/core';
import { DispersionesMasivasService } from 'src/app/services/dispersiones-masivas.service';
import { environment } from 'src/environments/environment';
import {
  FormBuilder,

  FormGroup,
  Validators,
} from '@angular/forms';
import { instituciones } from 'src/app/catalogos/instituciones';
import { tipopago } from 'src/app/catalogos/tipo_pago';
import { catchError, of, map, firstValueFrom, Observable } from 'rxjs';
import { AlertController } from '@ionic/angular';

import { UtilsService } from 'src/app/services/utils.service';
import { SpeiService } from 'src/app/services/spei.service';
import { TesoreriaService } from 'src/app/services/tesoreria.service';
import { Router } from '@angular/router';
import { OtpServiceService } from 'src/app/services/otp-service.service';

@Component({
  selector: 'app-registrar-orden',
  templateUrl: './registrar-orden.page.html',
  styleUrls: ['./registrar-orden.page.scss'],
})
export class RegistrarOrdenPage implements AfterViewInit {
  datosCliente: any;
  formOrden!: FormGroup;
  empresa = environment.empresa;
  clave: string = "0";
  folioOrigen: string = "0";
  institucionSeleccionada: boolean = false;
  institucionesList = instituciones;
  tipoPagoList = tipopago;
  code: number | null = null;
  message: string = '';
  resendDisabled: boolean = true;
  timer: any;
  timeLeft: number = 120;
  alertInstance: HTMLIonAlertElement | null = null;
  incorrectMessage: string = '';
  fechaOperacion: string = "";
  datosSaldo: any = {
    codigo: 0,
    info: { saldo: 0 },
    mensaje: '',
  };
  ordenate: any = {
    cuentaOrdenante: "000000000000000000",
    nombreOrdenante: "CAJA_RDAM",
    rfcCurpOrdenante: "ND",
    tipoCuentaOrdenante: "40",
    institucionOperante: "00000",
    cveCliente: "00",
    comicion: 0,
    saldo_minimo: 0
  };

  procesandoPago: boolean = false;
  progresoCarga: number = 0;
  colorProgreso: string = "primary";
  totalMontos: number = 0;
  montoComicion: number = 0;
  mostrarTotalMontos: boolean = false;
  datosComisiones: any = null;

  constructor(
    private formBuilder: FormBuilder,
    private dispersionesMasivasSrv: DispersionesMasivasService,
    private alertCtrl: AlertController,
    private spei: SpeiService,
    private utils: UtilsService,
    private teso: TesoreriaService,
    private router: Router,
    private otpService: OtpServiceService,
  ) {
    this.formOrden = this.formBuilder.group({
      cuentaBeneficiario: [
        '',
        [
          Validators.required,
          Validators.pattern('^\\s*(\\d\\s*){10}$|^\\s*(\\d\\s*){16}$|^\\s*(\\d\\s*){18}$'),
          Validators.maxLength(21)
        ],
      ],
      institucionContraparte: ['', Validators.required],
      nombreBeneficiario: ['', [Validators.required, Validators.maxLength(40)]],
      rfcCurpBeneficiario: [
        '',
        [Validators.required, Validators.pattern('^[A-Z0-9]{2}$|^[A-Z0-9]{12}$|^[A-Z0-9]{13}$|^[A-Z0-9]{18}$')], // 12 o 18 caracteres alfanuméricos
      ],
      conceptoPago: ['', Validators.required],
      referenciaNumerica: [
        '',
        [Validators.required, Validators.pattern('^[0-9]{7}$')],
      ],
      monto: [
        '',
        [
          Validators.required,
          Validators.min(0.01),
          Validators.pattern('^[0-9]+(\.[0-9]+)?$')
        ]
      ],
      tipoPago: ['', Validators.required],
    });
  }

  ngAfterViewInit(): void {
    const storedData = localStorage.getItem('datosCliente');
    if (storedData) {
      this.datosCliente = JSON.parse(storedData);
    }
    this.llenarOrdenanteDesdeStorage();
    this.searchSaldoCliente();
    this.formOrden.get('tipoPago')?.disable();
    this.formOrden.reset();
    Object.keys(this.formOrden.controls).forEach(key => {
      this.formOrden.get(key)?.setValue(null);
    });
    this.generarReferenciaNumerica();
  }

  clavedeRastreo(): Promise<string> {
    return firstValueFrom(this.utils.getUltimaClaveRastreo())
      .then((valor) => {
        this.clave = valor.nuevaClave;
        const numeroFolio = parseInt(valor.nuevaClave.slice(-4), 10).toString();
        this.folioOrigen = numeroFolio;
        return valor.nuevaClave;
      })
      .catch((err) => {
        console.error('Error al obtener la clave:', err);
        throw err;
      });
  }

  searchSaldoCliente() {
    const json = {
      datos: {
        numero_cliente: this.datosCliente.numero_cliente
      },
      accion: 1,
    };

    this.teso.saldoCliente(json).subscribe({
      next: (resp: any) => {
        const saldoOriginal = parseFloat(resp.info?.saldo ?? '0') || 0;

        this.teso.getDatosComiciones({ numero_cliente: this.datosCliente.numero_cliente }).subscribe({
          next: (comicionesResp: any) => {
            this.datosComisiones = comicionesResp;

            let saldoMinimo = 0;
            const comisionData = comicionesResp?.info?.[0];

            if (comisionData && comisionData.estatus === true) {
              saldoMinimo = parseFloat(comisionData.saldo_minimo ?? '0') || 0;
            }

            const saldoReal = saldoOriginal - saldoMinimo;

            this.datosSaldo = {
              codigo: resp.codigo,
              info: {
                ...resp.info,
                saldo: saldoReal
              },
              mensaje: resp.mensaje,
            };
          },
          error: (err) => {
            console.error('Error al obtener las comisiones del cliente', err);
          }
        });
      },
      error: (err) => {
        console.error('Error al obtener el saldo del cliente', err);
        this.router.navigate(['/inicio']);
      }
    });
  }


  searchSaldoClienteValidacion(monto: string): Observable<boolean> {
    const json = {
      datos: {
        numero_cliente: this.datosCliente.numero_cliente,
        monto: monto
      },
      accion: 1,
    };

    return this.teso.saldoClienteValidacion(json).pipe(
      map((resp: any) => {
        if (resp.codigo === "0" && resp.info.saldo >= parseFloat(monto)) {
          return true;
        } else {
          return false;
        }
      }),
      catchError((err) => {
        console.error('Error al verificar saldo', err);
        return of(false);
      })
    );
  }


  llenarOrdenanteDesdeStorage() {
    const storedData = localStorage.getItem('datosCliente');
    if (storedData) {
      const datos = JSON.parse(storedData);
      const cuentaOrdenante = datos.clabe || "000000000000000000";
      let tipoCuentaOrdenante = "Desconocido";
      const primerosTres = cuentaOrdenante.substring(0, 3);
      const institucionEncontrada = this.institucionesList.find(
        (institucion) => institucion.inicioClabe === primerosTres
      );

      switch (cuentaOrdenante.length) {
        case 16:
          tipoCuentaOrdenante = "3";
          break;
        case 10:
          tipoCuentaOrdenante = "10";
          break;
        case 18:
          tipoCuentaOrdenante = "40";
          break;
      }

      this.ordenate = {
        cuentaOrdenante: cuentaOrdenante,
        nombreOrdenante: (datos.nombre_prospecto || environment.empresa).substring(0, 40),
        rfcCurpOrdenante: datos.rfcCurpOrdenante || "ND",
        tipoCuentaOrdenante: tipoCuentaOrdenante,
        institucionOperante: institucionEncontrada,
        cveCliente: datos.clave_cliente.replace(/^TIJ-0+|-[A-Z]+$/g, ''),
        comicion: datos.comision_spei ?? 0,
        saldo_minimo: datos.saldo_minimo ?? 0
      };
    }
  }

  async registrarPago() {
    this.avanzarProgreso(0.1);

    if (!this.formOrden.valid) {
      this.finalizarProgreso();
      return;
    }

    const formData = { ...this.formOrden.getRawValue() };
    this.procesandoPago = true;
    this.progresoCarga = 0;
    this.colorProgreso = "primary";

    await this.searchSaldoCliente();

    if (!formData.monto.includes('.')) {
      formData.monto += '.00';
    }

    const montoFormulario = parseFloat(formData.monto);
    let tipoCuentaBeneficiario: string;

    switch (formData.cuentaBeneficiario.length) {
      case 16: tipoCuentaBeneficiario = "3"; break;
      case 10: tipoCuentaBeneficiario = "10"; break;
      case 18: tipoCuentaBeneficiario = "40"; break;
      default:
        this.presentAlert("Tipo de cuenta del beneficiario inválido.");
        this.finalizarProgreso();
        return;
    }

    let saldoValido = true;
    try {
      const isValid = await firstValueFrom(this.searchSaldoClienteValidacion(this.totalMontos.toString()));
      if (isValid) {
        saldoValido = false;
      }
    } catch {
      saldoValido = false;
    }

    if (!this.datosSaldo?.info?.saldo || montoFormulario > this.datosSaldo.info.saldo || !saldoValido) {
      this.presentAlert("Saldo insuficiente para esta operación.");
      this.finalizarProgreso();
      return;
    }

    if (!navigator.geolocation) {
      this.presentAlert("Geolocalización no disponible.");
      this.finalizarProgreso();
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      this.avanzarProgreso(0.3);

      const otpVerified = await this.sendOtp(this.datosCliente.correo_electronico.trim());

      if (!otpVerified) {
        this.finalizarProgreso();
        return;
      }

      this.avanzarProgreso(0.6);

      const payload = {
        pago: {
          conceptoPago: formData.conceptoPago.trim(),
          cuentaOrdenante: this.ordenate.cuentaOrdenante.trim(),
          cuentaBeneficiario: formData.cuentaBeneficiario.trim(),
          empresa: this.empresa.trim(),
          institucionContraparte: formData.institucionContraparte.trim(),
          institucionOperante: this.ordenate.institucionOperante.participante.trim(),
          monto: formData.monto.trim(),
          nombreBeneficiario: formData.nombreBeneficiario.trim(),
          nombreOrdenante: this.ordenate.nombreOrdenante.trim(),
          referenciaNumerica: formData.referenciaNumerica.trim(),
          rfcCurpBeneficiario: formData.rfcCurpBeneficiario.trim(),
          rfcCurpOrdenante: this.ordenate.rfcCurpOrdenante.trim(),
          tipoCuentaBeneficiario: tipoCuentaBeneficiario,
          tipoCuentaOrdenante: this.ordenate.tipoCuentaOrdenante.trim(),
          tipoPago: "1",
          latitud: position.coords.latitude.toString().trim(),
          longitud: position.coords.longitude.toString().trim()
        },
        cliente: {
          datos: {
            numero_cliente: this.datosCliente.numero_cliente,
            montoConComicion: this.totalMontos
          },
          accion: 1
        }
      };

      this.avanzarProgreso(0.8);

      this.dispersionesMasivasSrv.envioPagos(payload).subscribe({
        next: async (response) => {
          console.log(response);
          if (response.codigo !== "0") {
            this.presentAlert(response.info.mensaje || 'Ocurrió un error inesperado');
            this.finalizarProgreso();
            this.searchSaldoCliente();
          } else {
            this.presentAlert('Pago realizado con éxito');
            this.comprobanteCorreo(payload.pago.monto, payload.pago.referenciaNumerica);
            this.formOrden.reset();
            this.searchSaldoCliente();
            this.finalizarProgreso();
            this.mostrarTotalMontos = false;
            this.totalMontos = 0;
            this.generarReferenciaNumerica();
          }
        },
        error: (error) => {
          this.presentAlert(`Error al procesar el pago: ${error.message || 'Error desconocido'}`);
          this.finalizarProgreso();
        }
      });

    }, (error) => {
      this.presentAlert("Error al conseguir la geolocalización.");
      this.finalizarProgreso();
    });
  }


  generarReferenciaNumerica() {
    let numeroAleatorio = Math.floor(1000000 + Math.random() * 9000000);
    this.formOrden.get('referenciaNumerica')?.setValue(numeroAleatorio.toString());
    this.formOrden.get('referenciaNumerica')?.disable();
    this.formOrden.get('referenciaNumerica')?.updateValueAndValidity();
  }

  async presentAlert(message: string) {
    const alert = await this.alertCtrl.create({
      header: "Alerta",
      message: message,
      buttons: ["Aceptar"],
      cssClass: "custom-alert",
    });

    await alert.present();
  }

  limpiarYVerificarCuenta() {
    let cuenta = this.formOrden.value.cuentaBeneficiario || "";
    cuenta = cuenta.replace(/\s+/g, "").substring(0, 18);
    this.formOrden.patchValue({ cuentaBeneficiario: cuenta });
    this.verificarCuentaBeneficiario(cuenta);
  }

  verificarCuentaBeneficiario(cuenta: string) {
    const primerosTres = cuenta.substring(0, 3);
    const institucionEncontrada = this.institucionesList.find(
      (institucion) => institucion.inicioClabe === primerosTres
    );

    if (institucionEncontrada) {
      this.formOrden.patchValue({
        institucionContraparte: institucionEncontrada.participante,
      });
      this.institucionSeleccionada = true;
    } else {
      this.institucionSeleccionada = false;
    }
  }

  // Método para avanzar la barra de progreso manualmente
  avanzarProgreso(valor: number) {
    this.progresoCarga = valor;
  }

  // Método para detener la barra de progreso y mostrar el botón nuevamente
  finalizarProgreso() {
    this.procesandoPago = false;
    this.progresoCarga = 0;
  }


  async validarMonto() {
    let monto = this.formOrden.get('monto')?.value;

    // Prevenir error si es solo punto decimal
    if (monto && monto.startsWith('.')) {
      monto = '0' + monto;
      this.formOrden.patchValue({ monto });
    }

    const montoNumerico = parseFloat(monto);
    let comisionConIVA = 0;

    // Validar comisión solo si datosComisiones existen y estatus es true
    const comisionData = this.datosComisiones?.info?.[0];
    if (comisionData && comisionData.estatus === true) {
      const comisionBase = parseFloat(this.ordenate.comicion) || 0;
      comisionConIVA = comisionBase * 1.16;
    }

    const total = montoNumerico + comisionConIVA;

    // Mostrar total de montos con comisión
    this.totalMontos = total;
    this.mostrarTotalMontos = true;

    const saldoDisponible = this.datosSaldo?.info?.saldo || 0;

    if (total > saldoDisponible) {
      const alert = await this.alertCtrl.create({
        header: 'Saldo insuficiente',
        message: `El monto total (${total.toFixed(2)}) supera tu saldo disponible (${saldoDisponible.toFixed(2)}).`,
        buttons: ['Aceptar'],
      });
      await alert.present();

      this.formOrden.patchValue({ monto: '' });
      this.totalMontos = 0;
      this.mostrarTotalMontos = false;
    }
  }

  async comprobanteCorreo(monto: any, claveRastreo: any) {
    if (!this.datosCliente?.correo_electronico || !monto || !claveRastreo) {
      return;
    }

    const data = {
      emailUser: this.datosCliente.correo_electronico.trim(),
      persona: this.datosCliente.nombre_prospecto.trim(),
      monto: monto.toString().trim(),
      fecha: this.fechaOperacion,
      clabeRastreo: claveRastreo.toString().trim(),
      clabe: this.ordenate.cuentaOrdenante.trim()
    };

    try {
      await firstValueFrom(this.spei.comprobanteCorreo(data));
    } catch (error) {
      console.error("Error al enviar el comprobante por correo:", error);
    }
  }


  sendOtp(email: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (email) {
        // Mostrar mensaje de envío antes de hacer la petición
        this.message = 'Enviando código al correo...';
        this.incorrectMessage = '';

        this.otpService.sendOtp(email).subscribe(
          (response) => {
            this.message = 'Código enviado al correo.';
            this.resendDisabled = true;
            this.timeLeft = 120;
            this.startTimer();
            this.openOtpModal(email, resolve);
          },
          (error) => {
            this.message = 'Error al enviar el código.';
            resolve(false);
          }
        );
      } else {
        resolve(false);
      }
    });
  }


  startTimer() {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.resendDisabled = false;
      }
      this.updateAlertMessage();
    }, 1000);
  }

  async openOtpModal(email: string, resolve: (value: boolean | PromiseLike<boolean>) => void) {
    this.alertInstance = await this.alertCtrl.create({
      header: 'Ingresar Codigo de verificación',
      message: `
     
        Tiempo restante: ${this.timeLeft} segundos
        ${this.incorrectMessage ? `${this.incorrectMessage}` : ''}
        Si termina el tiempo, cancela y vuelve a intentar.
    
    `,
      inputs: [
        {
          name: 'otpCode',
          type: 'number',
          placeholder: 'Introduce el código de verificación'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            clearInterval(this.timer);
            resolve(false); // Usuario canceló
          }
        },
        {
          text: 'Verificar',
          handler: async (data) => {
            const isValid = await this.verifyOtp(email, data.otpCode);
            resolve(isValid); // Validamos el código OTP
            return isValid;
          }
        }
      ]
    });

    await this.alertInstance.present();
    this.updateAlertMessage();
  }

  updateAlertMessage() {
    if (this.alertInstance) {
      this.alertInstance.message = `Tiempo restante: ${this.timeLeft} segundos` + (this.incorrectMessage ? `${this.incorrectMessage}` : '');
    }
  }

  verifyOtp(email: string, code: number) {
    return new Promise<boolean>((resolve) => {
      if (email && code !== null) {
        this.otpService.verifyOtp(email, code).subscribe(valid => {
          if (valid) {
            this.message = 'Código correcto. Autenticación exitosa.';
            clearInterval(this.timer);
            resolve(true);
          } else {
            this.message = ' : Código incorrecto. Puedes intentarlo de nuevo.';
            this.incorrectMessage = ' : Código incorrecto. Inténtalo nuevamente.';
            this.resendDisabled = false;
            this.updateAlertMessage();
            resolve(false);
          }
        });
      } else {
        resolve(false);
      }
    });
  }


}
