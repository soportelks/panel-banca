import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { instituciones } from 'src/app/catalogos/instituciones';
import { tipopago } from 'src/app/catalogos/tipo_pago';
import { tipo_traspasos } from 'src/app/catalogos/tipos_traspasos';
import { SpeiService } from 'src/app/services/spei.service';
import { TesoreriaService } from 'src/app/services/tesoreria.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-traspaso',
  templateUrl: './traspaso.page.html',
  styleUrls: ['./traspaso.page.scss'],
})
export class TraspasoPage implements OnInit {
  datosCliente: any;
  segmentValue: string = '1';
  formOrden!: FormGroup;
  formTraspaso!: FormGroup;
  empresa = environment.empresa;
  fechaOperacion: string = "";
  institucionesList = instituciones;
  tiposTraspasosList = tipo_traspasos;
  tipoPagoList = tipopago;
  clientes: string | undefined;
  datosSaldo: any = {
    codigo: 0,
    info: { saldo: 0 },
    mensaje: '',
  };

  datosSaldoParteSocial: any = {
    codigo: 0,
    info: { saldo: 0 },
    mensaje: '',
  };
  ordenate: any = {
    cuentaOrdenante: "646180606500000000",
    nombreOrdenante: "CAJA_RDAM",
    rfcCurpOrdenante: "CRP240624C11",
    tipoCuentaOrdenante: "40",
    institucionOperante: "00000",
    cveCliente: "01",
  };

  constructor(
    private formBuilder: FormBuilder,
    private spei: SpeiService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private cdr: ChangeDetectorRef,
    private teso: TesoreriaService,
    private router: Router,
  ) {
    this.formOrden = this.formBuilder.group({
      tipos_traspaso: ['', Validators.required],
      monto: [
        '',
        [
          Validators.required,
          Validators.min(0.01),
          Validators.pattern('^[0-9]+(\.[0-9]+)?$') // Acepta cualquier cantidad de decimales
        ]
      ]
    });
    this.formTraspaso = this.formBuilder.group({
      cuentaBeneficiario: [
        '',
        [
          Validators.required,
          Validators.pattern('^[A-Za-z0-9-]{1,18}$'),  // Acepta entre 1 y 18 dígitos numéricos
          Validators.minLength(1),                     // Longitud mínima 1
          Validators.maxLength(18)                     // Longitud máxima 18
        ],
      ],
      tipos_traspaso: ['', Validators.required],
      monto: [
        '',
        [
          Validators.required,
          Validators.min(0.01),
          Validators.pattern('^[0-9]+(\.[0-9]+)?$') // Acepta cualquier cantidad de decimales
        ]
      ]
    });
  }

  ngOnInit() {
    const storedData = localStorage.getItem('datosCliente');
    if (storedData) {
      this.datosCliente = JSON.parse(storedData);
    }
    this.llenarOrdenanteDesdeStorage();
    this.searchSaldoCliente();
    this.searchSaldoClienteSocial();
    this.getFechaOperacion();
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

  /**
 * Metodo que busca el saldo del cliente
 * @returns void
 */
  searchSaldoClienteSocial() {
    let accion: number = 2;
    const tipoTraspasoSeleccionado = this.formOrden.get('tipos_traspaso')?.value || this.formTraspaso.get('tipos_traspaso')?.value;

    switch (tipoTraspasoSeleccionado) {
      case '0001':
        accion = 2;
        break;
      case '0002':
        accion = 3;
        break;
      case '0003':
        accion = 3;
        break;
      case '0004':
        accion = 4;
        break;
      default:
        accion = 2;
    }

    const json = {
      datos: {
        numero_cliente: this.datosCliente.numero_cliente
      },
      accion: accion,
    };

    this.teso.saldoCliente(json).subscribe({
      next: (resp: any) => {
        this.datosSaldoParteSocial = {
          codigo: resp.codigo,
          info: resp.info,
          mensaje: resp.mensaje,
        };
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.router.navigate(['/inicio']);
      }
    });
  }

  searchCLAVE(cuenta: any) {
    const json = {
      datos: {
        cve_cliente: cuenta,
      }
    };

    this.teso.getClaveCliente(json).subscribe({
      next: (resp) => {
        if (resp.codigo === '0') {
          const cliente = resp.info[0].cve_cliente.replace(/^TIJ-0+|-[A-Z]+$/g, '');
          this.clientes = cliente;
        } else {
          this.formTraspaso.patchValue({ cuentaBeneficiario: '' });
          this.presentAlert('Cliente para hacer el traspaso incorrecto');
        }
      },
      error: () => {
        this.formTraspaso.patchValue({ cuentaBeneficiario: '' });
        this.presentAlert('Los datos de este cliente no están disponibles en este momento');
      }
    });
  }


  llenarOrdenanteDesdeStorage() {
    const storedData = localStorage.getItem('datosCliente');

    if (storedData) {
      const datos = JSON.parse(storedData);

      const cuentaOrdenante = datos.clabe || "646180606500000000";
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
        nombreOrdenante: (datos.nombre_prospecto || "CAJA_RDAM").substring(0, 40),
        rfcCurpOrdenante: datos.rfcCurpOrdenante || "ND",
        tipoCuentaOrdenante: tipoCuentaOrdenante,
        institucionOperante: institucionEncontrada,
        cveCliente: datos.clave_cliente.replace(/^TIJ-0+|-[A-Z]+$/g, '')
      };
    }
  }

  limpiarYVerificarCuenta() {
    let cuenta = this.formTraspaso.value.cuentaBeneficiario || "";
    cuenta = cuenta.replace(/\s+/g, "").substring(0, 18);
    this.formTraspaso.patchValue({ cuentaBeneficiario: cuenta });
    this.searchCLAVE(cuenta);
  }

  getFechaOperacion(): string {
    let nowMX = new Date(new Date().toLocaleString(environment.locale, { timeZone: environment.timeZone }));
    this.fechaOperacion = nowMX.toISOString().split("T")[0];
    return this.fechaOperacion;
  }

  validarMonto() {
    let monto = this.formOrden.get('monto')?.value;

    if (monto && monto.startsWith('.')) {
      this.formOrden.patchValue({ monto: '0' + monto });
    }
  }

  async crudMovimientoTraspasoMismaCuentas() {
    const loading = await this.presentLoading("Procesando pagos...");
    const tipoTraspaso = this.formOrden.get('tipos_traspaso')?.value;
    let claveTraspaso = "0002";

    const montoFormulario = parseFloat(this.formOrden.get('monto')?.value || "0");
    const saldoDisponibleVista = parseFloat(this.datosSaldo?.info?.saldo || "0");
    const saldoDisponibleMenor = parseFloat(this.datosSaldoParteSocial?.info?.saldo || "0");

    if (tipoTraspaso === '0002') {
      if (montoFormulario > saldoDisponibleMenor) {
        this.presentAlert("Saldo a la vista insuficiente para esta operación.");
        await loading.dismiss();
        return;
      }
      claveTraspaso = "0003";
    }

    if (montoFormulario > saldoDisponibleVista) {
      this.presentAlert("Saldo a la vista insuficiente para esta operación.");
      await loading.dismiss();
      return;
    }

    const data = {
      "cveCliente": this.ordenate.cveCliente,
      "usuario": environment.usuarioTraspasos,
      "cveSucursal": environment.cveSucursal,
      "cveCaja": environment.cveCaja,
      "movimientos": [
        [
          "03",
          "02",
          claveTraspaso,
          montoFormulario,
          null,
          0,
          null,
          null,
          null,
          null,
          this.fechaOperacion
        ]
      ]
    };

    const dataResponse = {
      "cveCliente": this.ordenate.cveCliente,
      "usuario": environment.usuarioTraspasos,
      "cveSucursal": environment.cveSucursal,
      "cveCaja": environment.cveCaja,
      "movimientos": [
        [
          "03",
          "01",
          tipoTraspaso,
          montoFormulario,
          null,
          0,
          null,
          null,
          null,
          null,
          this.fechaOperacion
        ]
      ]
    };

    this.spei.crudMovimientoTraspaso(data).subscribe({
      next: async (response) => {
        const resultadoStr = response.resultado.split(",")[0].trim();
        const codigo = Number(resultadoStr);

        if (codigo === 0) {
          this.spei.crudMovimientoTraspaso(dataResponse).subscribe({
            next: async () => {
              await loading.dismiss(); // Cierra la alerta de carga
              this.presentAlert(`Traspaso registrado con éxito`);
              this.searchSaldoCliente();
              this.searchSaldoClienteSocial();
              this.formTraspaso.reset();
              await loading.dismiss();
            },
            error: async () => {
              await loading.dismiss(); // Cierra la alerta de carga en caso de error
              this.presentAlert(`Error al registrar el Traspaso`);
            }
          });
        } else {
          await loading.dismiss();
          this.presentAlert(`Error al realizar el traspaso`);
          this.searchSaldoCliente();
          this.searchSaldoClienteSocial();
        }
      },
      error: async () => {
        await loading.dismiss();
        this.presentAlert(`Error al registrar el Traspaso`);
      }
    });
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

  async presentLoading(mensaje: string) {
    const loading = await this.loadingCtrl.create({
      message: mensaje,
      spinner: "crescent",
    });
    await loading.present();
    return loading;
  }

  onSegmentChanged(event: any) { }

  async crudMovimientoTraspasoTerceros() {
    const loading = await this.presentLoading("Procesando pagos...");
    const tipoTraspaso = this.formTraspaso.get('tipos_traspaso')?.value;

    const montoFormulario = parseFloat(this.formTraspaso.get('monto')?.value || "0");
    const saldoDisponibleVista = parseFloat(this.datosSaldo?.info?.saldo || "0");

    if (montoFormulario > saldoDisponibleVista) {
      this.presentAlert("Saldo a la vista insuficiente para esta operación.");
      await loading.dismiss();
      return;
    }

    if (this.ordenate.cveCliente === this.clientes) {
      this.presentAlert("No se puede realizar al mismo cliente de la cuenta");
      await loading.dismiss();
      return;
    }

    const data = {
      "cveCliente": this.ordenate.cveCliente,
      "usuario": environment.usuarioTraspasos,
      "cveSucursal": environment.cveSucursal,
      "cveCaja": environment.cveCaja,
      "movimientos": [
        [
          "03",
          "02",
          "0002",
          montoFormulario,
          null,
          0,
          null,
          null,
          null,
          null,
          this.fechaOperacion
        ]
      ]
    };

    const dataResponse = {
      "cveCliente": this.clientes,
      "usuario": environment.usuarioTraspasos,
      "cveSucursal": environment.cveSucursal,
      "cveCaja": environment.cveCaja,
      "movimientos": [
        [
          "03",
          "01",
          tipoTraspaso,
          montoFormulario,
          null,
          0,
          null,
          null,
          null,
          null,
          this.fechaOperacion
        ]
      ]
    };

    this.spei.crudMovimientoTraspaso(data).subscribe({
      next: async (response) => {
        const resultadoStr = response.resultado.split(",")[0].trim();
        const codigo = Number(resultadoStr);

        if (codigo === 0) {
          this.spei.crudMovimientoTraspaso(dataResponse).subscribe({
            next: async () => {
              await loading.dismiss();
              this.presentAlert(`Traspaso registrado con éxito`);
              this.searchSaldoCliente();
              this.searchSaldoClienteSocial();
              this.formOrden.reset();
              await loading.dismiss();
            },
            error: async () => {
              await loading.dismiss();
              this.presentAlert(`Error al registrar el Traspaso`);
            }
          });
        } else {
          await loading.dismiss();
          this.presentAlert(`Error al realizar el traspaso`);
          this.searchSaldoCliente();
          this.searchSaldoClienteSocial();
        }
      },
      error: async () => {
        await loading.dismiss();
        this.presentAlert(`Error al registrar el Traspaso`);
      }
    });
  }

}
