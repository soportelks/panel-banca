import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { AlertController, LoadingController } from "@ionic/angular";
import { DispersionesMasivasService } from "src/app/services/dispersiones-masivas.service";
import { tipoCuentas } from '../../catalogos/tipo_cuenta';
import * as XLSX from 'xlsx';
import { catchError, firstValueFrom, forkJoin, lastValueFrom, map, Observable, of } from "rxjs";
import { environment } from "src/environments/environment";
import { HttpClient } from "@angular/common/http";

import { instituciones } from "src/app/catalogos/instituciones";
import { UtilsService } from "src/app/services/utils.service";
import { SpeiService } from "src/app/services/spei.service";
import { Router } from "@angular/router";
import { TesoreriaService } from "src/app/services/tesoreria.service";
import { OtpServiceService } from "src/app/services/otp-service.service";


@Component({
  selector: "app-dispersion-masiva-pagos",
  templateUrl: "./dispersion-masiva-pagos.page.html",
  styleUrls: ["./dispersion-masiva-pagos.page.scss"],
})
export class DispersionMasivaPagosPage implements OnInit {
  @ViewChild("fileInput") fileInput!: ElementRef;
  institucionesList = instituciones;

  public csvData: any[] = [];
  datosCliente: any;
  fechaOperacion: string = new Date().toISOString().split("T")[0].replace(/-/g, "");
  code: number | null = null;
  message: string = '';
  resendDisabled: boolean = true;
  timer: any;
  timeLeft: number = 120;
  alertInstance: HTMLIonAlertElement | null = null;
  incorrectMessage: string = '';
  totalMontos: number = 0;
  montoComicion: number = 0;
  mostrarTotalMontos: boolean = false;
  mostrarBotonProcesar: boolean = true;
  isProcessing: boolean = false;
  idLoteActual: string = '';
  datosComisiones: any = null;

  datosSaldo: any = {
    codigo: 0,
    info: { saldo: 0 },
    mensaje: '',
  };

  ordenate: any = {
    cuentaOrdenante: "000000000000000000",
    nombreOrdenante: environment.empresa,
    rfcCurpOrdenante: "NA",
    tipoCuentaOrdenante: "40",
    cveCliente: "00",
    comicion: 0,
    saldo_minimo: 0
  };

  clave: string = "0";
  folioOrigen: string = "0";

  public headersConfig = [
    { key: "INSTITUCION_CONTRAPARTE", title: "institución Contraparte" },
    { key: "CLAVE_RASTREO", title: "Clave de Rastreo" },
    { key: "NOMBRE_BENEFICIARIO", title: "Nombre del Beneficiario" },
    { key: "RFC_CURP_BENEFICIARIO", title: "RFC/Curp Beneficiario" },
    { key: "TIPO_PAGO", title: "tipo Pago" },
    { key: "TIPO_CUENTA_BENEFICIARIO", title: "Tipo Cuenta Beneficiario" },
    { key: "MONTO", title: "Monto" },
    { key: "CUENTA_BENEFICIARIO", title: "Cuenta Beneficiario" },
    { key: "CONCEPTO_PAGO", title: "Concepto de Pago" },
    { key: "REFERENCIA_NUMERICA", title: "Referencia Numérica" },
    { key: "INSTITUCION_OPERANTE", title: "institucionOperante" },
    { key: "EMPRESA", title: "Empresa" },
  ];

  keyMapping: { [key: string]: string } = {
    institucionContraparte: "INSTITUCION_CONTRAPARTE",
    claveRastreo: "CLAVE_RASTREO",
    nombreBeneficiario: "NOMBRE_BENEFICIARIO",
    rfcCurpBeneficiario: "RFC_CURP_BENEFICIARIO",
    tipoPago: "TIPO_PAGO",
    tipoCuentaBeneficiario: "TIPO_CUENTA_BENEFICIARIO",
    monto: "MONTO",
    cuentaBeneficiario: "CUENTA_BENEFICIARIO",
    conceptoPago: "CONCEPTO_PAGO",
    referenciaNumerica: "REFERENCIA_NUMERICA",
    institucionOperante: "INSTITUCION_OPERANTE",
    empresa: "EMPRESA",
    tipoCuentaOrdenante: "TIPO_CUENTA_ORDENANTE"
  };

  paginatedData: any[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;

  get totalPages(): number {
    return Math.ceil(this.csvData.length / this.itemsPerPage);
  }
  get expectedHeaders(): string[] {
    return this.headersConfig.map((header) => header.key);
  }

  constructor(
    private alertCtrl: AlertController,
    private dispersionesMasivasSrv: DispersionesMasivasService,
    private spei: SpeiService,
    private utils: UtilsService,
    private loadingCtrl: LoadingController,
    private teso: TesoreriaService,
    private router: Router,
    private otpService: OtpServiceService,
  ) {
  }

  ngOnInit() {
    this.updatePaginatedData(this.csvData);
    const storedData = localStorage.getItem('datosCliente');
    if (storedData) {
      this.datosCliente = JSON.parse(storedData);
    }
    this.llenarOrdenanteDesdeStorage();
    this.searchSaldoCliente();
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
        comicion: datos.comision_spei,
        saldo_minimo: datos.saldo_minimo
      };
    }
  }

  validateFile(file: File): boolean {
    const validExtensions = ["xlsx", "xls"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
    return validExtensions.includes(fileExtension);
  }

  parseXLSX(file: File) {
    this.getFechaOperacion();
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });

      if (!workbook.SheetNames || workbook.SheetNames.length < 3) {
        this.presentAlert("El archivo XLSX no tiene suficientes hojas.");
        return;
      }

      const sheetName = workbook.SheetNames[2];
      const worksheet = workbook.Sheets[sheetName];

      if (!worksheet) {
        this.presentAlert("No se pudo leer la hoja seleccionada del archivo XLSX.");
        return;
      }

      // Convertir la hoja a JSON
      const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" }) as any[];

      let errorMessage = "";

      if (sheetData.length === 0) {
        errorMessage = "El archivo XLSX está vacío o no tiene el formato correcto.";
      } else if (!this.isValidXLSXHeader(sheetData[0])) {
        errorMessage = "El archivo XLSX no tiene los encabezados correctos.";
      } else {

        const filteredData = sheetData.slice(1).filter((row) =>
          row.some((value: string | number | undefined) =>
            value !== 0 && value !== "0" && value !== ""
          )
        );

        if (filteredData.length > 250) {
          errorMessage = "El archivo XLSX contiene más registros de los esperados (máximo 250).";
        } else if (filteredData.length === 0) {
          errorMessage = "El archivo XLSX se encuentra vacío.";
        }

        if (errorMessage) {
          this.presentAlert(errorMessage);
        } else {
          // Si todo está bien, procesa los datos con geolocalización
          this.addGeolocationToData(filteredData);
        }
      }
    };
    reader.readAsBinaryString(file);
  }

  addGeolocationToData(data: any[]) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.processDataWithLocation(data, position.coords.latitude.toString(), position.coords.longitude.toString());
        },
        (error) => {
          this.processDataWithLocation(data, "21.1501049", "-100.9397616");
        }
      );
    } else {
      this.processDataWithLocation(data, "21.1501049", "-100.9397616");
    }
  }

  private async processDataWithLocation(data: any[], latitud: string, longitud: string) {
    const validData = data.filter((row) => {
      return !(
        String(row.INSTITUCION_CONTRAPARTE) === "#N/D" ||
        String(row.EMPRESA) === "#N/D" ||
        String(row.CLAVE_RASTREO) === "#N/D" ||
        String(row.INSTITUCION_OPERANTE) === "#N/D" ||
        String(row.MONTO) === "0" ||
        String(row.MONTO) === "0.00" ||
        String(row.TIPO_PAGO) === "#N/D" ||
        String(row.TIPO_CUENTA_BENEFICIARIO) === "#N/D" ||
        String(row.NOMBRE_BENEFICIARIO) === "#N/D" ||
        String(row.CUENTA_BENEFICIARIO) === "#N/D" ||
        String(row.RFC_CURP_BENEFICIARIO) === "#N/D" ||
        String(row.CONCEPTO_PAGO) === "#N/D" ||
        String(row.REFERENCIA_NUMERICA) === "#N/D"
      );
    });

    let sumaMontos = 0;
    let montoComicion = 0;

    const comisionData = this.datosComisiones?.info?.[0];
    const aplicarComision = comisionData && comisionData.estatus === true;

    const updatedData = validData.map((row) => {
      let monto = String(row[6]).trim();

      if (!monto.includes(".")) {
        monto += ".00";
      } else {
        const partes = monto.split(".");
        if (partes[1].length === 1) {
          monto += "0";
        }
      }

      const montoNumerico = parseFloat(monto);
      sumaMontos += montoNumerico;

      // Solo sumar comisión si estatus === true
      if (aplicarComision) {
        montoComicion += (parseFloat(this.ordenate.comicion) || 0) * 1.16;
      }

      const maxLength = 40;

      let nombreBeneficiario = String(row[2]).trim();
      if (nombreBeneficiario.length > maxLength) {
        nombreBeneficiario = nombreBeneficiario.substring(0, maxLength);
      }

      let nombreOrdenante = String(this.ordenate.nombreOrdenante).trim();
      if (nombreOrdenante.length > maxLength) {
        nombreOrdenante = nombreOrdenante.substring(0, maxLength);
      }

      return {
        institucionContraparte: String(row[0]).trim(),
        claveRastreo: String(row[1]).trim(),
        nombreBeneficiario: nombreBeneficiario,
        rfcCurpBeneficiario: String(row[3]).trim(),
        tipoPago: String(row[4]).trim(),
        tipoCuentaBeneficiario: String(row[5]).trim(),
        monto: monto,
        cuentaBeneficiario: String(row[7]).trim(),
        conceptoPago: String(row[8]).trim(),
        referenciaNumerica: String(row[9]).trim(),
        institucionOperante: String(row[10]).trim(),
        empresa: String(row[11]).trim(),
        cuentaOrdenante: String(this.ordenate.cuentaOrdenante).trim(),
        nombreOrdenante: nombreOrdenante,
        latitud: latitud.trim(),
        longitud: longitud.trim(),
        rfcCurpOrdenante: String(this.ordenate.rfcCurpOrdenante).trim(),
        tipoCuentaOrdenante: String(this.ordenate.tipoCuentaOrdenante).trim(),
      };
    });

    this.totalMontos = sumaMontos + montoComicion;
    this.montoComicion = montoComicion;

    this.mostrarTotalMontos = true;
    this.csvData = updatedData;

    await this.validarPagos(this.csvData);
    this.updatePaginatedData(this.csvData);
  }

  async procesarPagos() {

    const loading1 = await this.presentLoading("Procesando pagos...");

    if (this.csvData.length === 0) {
      this.presentAlert("No hay datos cargados para iniciar la dispersión.");
      await loading1.dismiss();
      this.mostrarBotonProcesar = true;
      return;
    }

    await this.searchSaldoCliente();

    const totalMonto = this.totalMontos.toFixed(2);

    if (!this.datosSaldo?.info?.saldo || totalMonto > this.datosSaldo.info.saldo) {
      this.presentAlert("Saldo insuficiente para esta operación.");
      await loading1.dismiss();
      this.mostrarBotonProcesar = true;
      return;
    }

    if (!this.validarPagos(this.csvData)) {
      await loading1.dismiss();
      this.mostrarBotonProcesar = true;
      return;
    }

    await loading1.dismiss();

    // Oculta el botón y espera la verificación OTP
    const otpVerified = await this.sendOtp(this.datosCliente.correo_electronico.trim());

    if (!otpVerified) {
      return;
    }

    const loading = await this.presentLoading("Procesando pagos...");

    const pagosLimpios = this.csvData.map(pago => ({
      conceptoPago: pago.conceptoPago,
      cuentaOrdenante: this.ordenate.cuentaOrdenante,
      cuentaBeneficiario: pago.cuentaBeneficiario,
      empresa: pago.empresa,
      institucionContraparte: pago.institucionContraparte,
      institucionOperante: this.ordenate.institucionOperante.participante,
      monto: pago.monto,
      nombreBeneficiario: pago.nombreBeneficiario,
      nombreOrdenante: this.ordenate.nombreOrdenante,
      referenciaNumerica: pago.referenciaNumerica,
      rfcCurpBeneficiario: pago.rfcCurpBeneficiario,
      rfcCurpOrdenante: this.ordenate.rfcCurpOrdenante,
      tipoCuentaBeneficiario: pago.tipoCuentaBeneficiario,
      tipoCuentaOrdenante: this.ordenate.tipoCuentaOrdenante,
      tipoPago: "1",
      latitud: pago.latitud,
      longitud: pago.longitud,
    }));

    const payload = {
      pago: pagosLimpios,
      cliente: {
        datos: {
          numero_cliente: this.ordenate.cveCliente,
          montoConComicion: this.totalMontos
        },
        accion: 1
      }
    };

    try {
      const respuesta = await this.dispersionesMasivasSrv.envioPagosMasivos(payload).toPromise();

      await loading.dismiss();
      this.mostrarBotonProcesar = true;

      if (respuesta.codigo === "0") {
        const mensaje = `✅ Procesamiento completado\n\n` +
          `✔️ Exitosos: ${respuesta.exitosos}\n` +
          `❌ Fallidos: ${respuesta.fallidos}`;

        this.presentAlert(mensaje);
        this.clearTableData();
        this.mostrarTotalMontos = false;
        this.totalMontos = 0;
        this.searchSaldoCliente();
      } else {
        this.presentAlert(`⚠️ Error: ${respuesta.mensaje || 'Error desconocido'}`);
      }

    } catch (error) {
      await loading.dismiss();
      this.presentAlert("❌ Ocurrió un error al procesar los pagos.");
      this.mostrarBotonProcesar = true;
    }
  }


  async presentLoading(mensaje: string) {
    const loading = await this.loadingCtrl.create({
      message: mensaje,
      spinner: "crescent",
    });
    await loading.present();
    return loading;
  }

  async clavedeRastreo(): Promise<string> {
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

  crudComision() {
    const data = {
      "cveCliente": this.ordenate.cveCliente,
      "usuario": environment.usuarioComisiones,
      "cveSucursal": environment.cveSucursal,
      "cveCaja": environment.cveCaja,
      "movimientos": [
        [
          "01",
          "02",
          "0007",
          this.ordenate.comicion,
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

    this.spei.crudMovimiento(data).subscribe({
      next: async (response) => {
        await this.searchSaldoCliente();
      },
      error: (err) => {
        this.searchSaldoCliente();
      }
    });
  }


  isValidCSVHeader(headers: string[]): boolean {
    return this.expectedHeaders.every((key) => headers.includes(key));
  }

  async validarPagos(csvData: any[]): Promise<boolean> {
    if (csvData.length > 250) {
      this.presentAlert("El archivo CSV contiene más registros de los esperados (máximo 100).");
      return false;
    }

    for (let item of csvData) {
      for (let key in item) {
        if (typeof item[key] === "string") {
          item[key] = item[key].replace(/ñ/gi, "n");
        }
      }

      if (!item.claveRastreo) {
        this.presentAlert("Uno o más registros no tienen clave de rastreo.");
        return false;
      }
      if (!item.cuentaBeneficiario || !/^[0-9]{10}$|^[0-9]{16}$|^[0-9]{18}$/.test(item.cuentaBeneficiario)) {
        this.presentAlert("Uno o más registros contienen cuentas de beneficiario inválidas.");
        return false;
      }
      if (!item.institucionContraparte) {
        this.presentAlert("Uno o más registros no tienen institución contraparte.");
        return false;
      }
      if (!item.nombreBeneficiario) {
        this.presentAlert("Uno o más registros no tienen nombre de beneficiario.");
        return false;
      }
      if (!item.rfcCurpBeneficiario || !/^[A-Z0-9]{2}$|^[A-Z0-9]{12}$|^[A-Z0-9]{13}$|^[A-Z0-9]{18}$/.test(item.tipoCuentaBeneficiario)) {
        this.presentAlert("Uno o más registros contienen RFC/CURP de beneficiario inválidos.");
        return false;
      }
      if (!item.conceptoPago) {
        this.presentAlert("Uno o más registros no tienen concepto de pago.");
        return false;
      }

      if (!item.referenciaNumerica || !/^[0-9]{1,7}$/.test(item.referenciaNumerica)) {
        const confirmed = await this.presentAlertConfirm(
          "Uno o más registros contienen referencias numéricas inválidas. ¿Desea generar una automáticamente?"
        );
        if (confirmed) {
          item.referenciaNumerica = Math.floor(1000000 + Math.random() * 9000000).toString();
        } else {
          await this.presentAlert("Uno o más registros contienen referencias numéricas inválidas.");
          return false;
        }
      }

      if (!item.empresa) {
        this.presentAlert("Uno o más registros no tienen empresa.");
        return false;
      }
      if (
        !item.monto ||
        isNaN(parseFloat(item.monto)) ||
        parseFloat(item.monto) < 0.01 ||
        !/^[0-9]+(\.[0-9]{1,2})?$/.test(item.monto)
      ) {
        this.presentAlert("Uno o más registros contienen montos inválidos.");
        return false;
      }
      if (!item.tipoPago) {
        this.presentAlert("Uno o más registros no tienen tipo de pago.");
        return false;
      }
    }

    return true;
  }


  clearTableData() {
    if (this.csvData.length > 0) {
      this.csvData = [];
      this.paginatedData = [];
      this.currentPage = 1;
      this.mostrarTotalMontos = false;
      this.totalMontos = 0;

      if (this.fileInput) {
        this.fileInput.nativeElement.value = "";
      }
    }
  }


  updatePaginatedData(data: any[]) {
    const cleanedData = data.map(item => {
      const newItem: any = {};

      Object.keys(item).forEach(originalKey => {
        const mappedKey = this.keyMapping[originalKey];
        if (mappedKey) {
          newItem[mappedKey] = item[originalKey];
        }
      });

      return newItem;
    });

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedData = cleanedData.slice(startIndex, endIndex);
  }

  isValidXLSXHeader(header: any[]): boolean {
    if (!Array.isArray(header) || header.length === 0) {
      return false;
    }

    return this.headersConfig.every((headerConfig, index) => {
      const cellValue = header[index] ? String(header[index]).trim().toLowerCase() : "";
      return cellValue === headerConfig.key.toLowerCase();
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

  changePage(page: number) {
    this.currentPage = page;
    this.updatePaginatedData(this.csvData);
  }

  async getFechaOperacion(): Promise<void> {
    this.utils.getFechaOperacion().subscribe({
      next: (response) => {
        this.fechaOperacion = response.fechaOperacion;
      },
      error: (error) => {
        console.error('Error al obtener la fecha de operación:', error);
      }
    });
  }

  async onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (this.validateFile(file)) {
        this.parseXLSX(file);
      } else {
        await this.presentAlert("Por favor carga un archivo XLSX válido.");
      }
    }
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

  async presentAlertConfirm(message: string): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertCtrl.create({
        header: "Alerta",
        message: message,
        buttons: [
          {
            text: "Cancelar",
            role: "cancel",
            handler: () => resolve(false),
          },
          {
            text: "Aceptar",
            handler: () => resolve(true),
          }
        ],
        cssClass: "custom-alert",
      });

      await alert.present();
    });
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


