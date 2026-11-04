import { Injectable, NgZone } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

interface TabMessage {
  type: 'CHECK_EXISTING_TAB' | 'TAB_ALREADY_ACTIVE' | 'MASTER_TAB_CLOSED' | 'PING_ALIVE' | 'PONG_ALIVE';
  senderTabId: string;
  targetTabId?: string;
  timestamp: number;
}

const STORAGE_MASTER_KEY = 'rdam_master_tab_id';
const STORAGE_HEARTBEAT_KEY = 'rdam_master_heartbeat';

@Injectable({
  providedIn: 'root',
})
export class SingleTabService {
  private readonly CHANNEL_NAME = 'rdam_banca_single_tab_channel';
  private channel: BroadcastChannel | null = null;
  public readonly tabId: string;

  private isBloqueadaSubject = new BehaviorSubject<boolean>(false);
  public readonly isBloqueada$: Observable<boolean> = this.isBloqueadaSubject.asObservable();

  private heartbeatInterval: any = null;

  private readonly publicRoutes = [
    '',
    '/',
    '/home',
    '/login',
    '/register',
    '/phone-code',
    '/photo',
    '/datos-alta',
    '/validacion',
    '/recover-passw',
    '/confirm-code',
    '/changue-passwd',
  ];

  constructor(
    private router: Router,
    private ngZone: NgZone
  ) {
    this.tabId = 'tab_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
    this.initChannel();
    this.iniciarMonitoreoRutas();
  }

  get isBloqueada(): boolean {
    return this.isBloqueadaSubject.value;
  }

  private initChannel() {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel(this.CHANNEL_NAME);
        this.channel.onmessage = (event: MessageEvent<TabMessage>) => {
          this.ngZone.run(() => {
            this.handleChannelMessage(event.data);
          });
        };
      } catch (e) {
        console.warn('BroadcastChannel no disponible en este entorno:', e);
      }
    }

    // Al cerrar la pestaña, notificar a las demás y limpiar si éramos master
    window.addEventListener('beforeunload', () => {
      this.limpiarRegistroAlCerrar();
    });

    window.addEventListener('pagehide', () => {
      this.limpiarRegistroAlCerrar();
    });
  }

  private iniciarMonitoreoRutas() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.evaluarEstadoPestana();
      });

    // Verificación inicial inmediata
    this.evaluarEstadoPestana();
  }

  public tieneSesionActiva(): boolean {
    const token = localStorage.getItem('token');
    const datosCliente = localStorage.getItem('datosCliente');
    return !!token && !!datosCliente;
  }

  public esRutaProtegida(): boolean {
    const rawUrl = (this.router.url || window.location.pathname || '')
      .split('?')[0]
      .replace(/\/$/, '') || '/';
    return !this.publicRoutes.includes(rawUrl);
  }

  /**
   * Evalúa si esta pestaña debe ser la maestra activa o si debe bloquearse
   */
  public evaluarEstadoPestana() {
    if (!this.tieneSesionActiva() || !this.esRutaProtegida()) {
      if (this.isBloqueada) {
        this.setBloqueada(false);
      }
      this.detenerHeartbeat();
      return;
    }

    const masterId = localStorage.getItem(STORAGE_MASTER_KEY);
    const lastBeat = parseInt(localStorage.getItem(STORAGE_HEARTBEAT_KEY) || '0', 10);
    const haceCuanto = Date.now() - lastBeat;
    const masterSigueVivo = masterId && haceCuanto < 2500;

    // Caso 1: No hay master registrado o somos nosotros mismos
    if (!masterId || !masterSigueVivo || masterId === this.tabId) {
      this.tomarControlComoPestanaMaestra();
      return;
    }

    // Caso 2: Hay otra pestaña registrada viva -> BLOQUEAR
    console.warn('[SEGURIDAD BANCARIA] Pestaña maestra activa detectada:', masterId, 'Bloqueando pestaña:', this.tabId);
    this.setBloqueada(true);

    if (this.channel) {
      this.channel.postMessage({
        type: 'CHECK_EXISTING_TAB',
        senderTabId: this.tabId,
        timestamp: Date.now(),
      });
    }
  }

  public tomarControlComoPestanaMaestra() {
    try {
      localStorage.setItem(STORAGE_MASTER_KEY, this.tabId);
      localStorage.setItem(STORAGE_HEARTBEAT_KEY, Date.now().toString());
    } catch {
      // ignore
    }
    this.setBloqueada(false);
    this.iniciarHeartbeat();
  }

  private iniciarHeartbeat() {
    this.detenerHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.tieneSesionActiva() && this.esRutaProtegida() && !this.isBloqueada) {
        try {
          localStorage.setItem(STORAGE_MASTER_KEY, this.tabId);
          localStorage.setItem(STORAGE_HEARTBEAT_KEY, Date.now().toString());
        } catch {
          // ignore
        }
      } else {
        this.detenerHeartbeat();
      }
    }, 1000);
  }

  private detenerHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private handleChannelMessage(msg: TabMessage) {
    if (!msg || msg.senderTabId === this.tabId) {
      return;
    }

    // 1. Otra pestaña pregunta si hay una activa:
    if (msg.type === 'CHECK_EXISTING_TAB') {
      if (this.tieneSesionActiva() && this.esRutaProtegida() && !this.isBloqueada) {
        this.channel?.postMessage({
          type: 'TAB_ALREADY_ACTIVE',
          senderTabId: this.tabId,
          targetTabId: msg.senderTabId,
          timestamp: Date.now(),
        });
      }
      return;
    }

    // 2. Nos confirman que ya hay una pestaña activa:
    if (msg.type === 'TAB_ALREADY_ACTIVE' && msg.targetTabId === this.tabId) {
      console.warn('[SEGURIDAD BANCARIA] Confirmación de pestaña activa recibida. Bloqueando.');
      this.setBloqueada(true);
      return;
    }

    // 3. PING para comprobar si seguimos vivos: responder PONG inmediatamente
    if (msg.type === 'PING_ALIVE') {
      if (this.tieneSesionActiva() && this.esRutaProtegida() && !this.isBloqueada) {
        this.channel?.postMessage({
          type: 'PONG_ALIVE',
          senderTabId: this.tabId,
          targetTabId: msg.senderTabId,
          timestamp: Date.now(),
        });
      }
      return;
    }

    // 4. La pestaña maestra cerró: desbloquear automáticamente esta pestaña si estaba en espera
    if (msg.type === 'MASTER_TAB_CLOSED') {
      console.log('[SEGURIDAD BANCARIA] La pestaña original se cerró. Desbloqueando automáticamente.');
      try {
        localStorage.removeItem(STORAGE_MASTER_KEY);
        localStorage.removeItem(STORAGE_HEARTBEAT_KEY);
      } catch {
        // ignore
      }
      if (this.isBloqueada && this.tieneSesionActiva()) {
        this.tomarControlComoPestanaMaestra();
      }
    }
  }

  private setBloqueada(bloqueada: boolean) {
    this.isBloqueadaSubject.next(bloqueada);
  }

  /**
   * Intenta reanudar en esta pestaña usando BroadcastChannel en tiempo real.
   * Si la otra pestaña responde PONG_ALIVE -> sigue abierta (retorna false).
   * Si ninguna pestaña responde PONG_ALIVE en 180ms -> ya se cerró (desbloquea y retorna true).
   */
  public intentarReanudar(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.channel) {
        this.tomarControlComoPestanaMaestra();
        resolve(true);
        return;
      }

      let otraPestanaRespondio = false;

      const tempHandler = (event: MessageEvent<TabMessage>) => {
        const msg = event.data;
        if (msg && msg.senderTabId !== this.tabId && msg.type === 'PONG_ALIVE' && msg.targetTabId === this.tabId) {
          otraPestanaRespondio = true;
        }
      };

      this.channel.addEventListener('message', tempHandler);

      // Enviamos el PING en tiempo real
      this.channel.postMessage({
        type: 'PING_ALIVE',
        senderTabId: this.tabId,
        timestamp: Date.now(),
      });

      setTimeout(() => {
        this.channel?.removeEventListener('message', tempHandler);

        if (otraPestanaRespondio) {
          // La pestaña original SIGUE ABIERTA
          console.warn('[SEGURIDAD BANCARIA] Pestaña original respondió PONG. Manteniendo bloqueo.');
          this.setBloqueada(true);
          resolve(false);
        } else {
          // La pestaña original YA NO EXISTE: tomar control y desbloquear
          console.log('[SEGURIDAD BANCARIA] Ninguna otra pestaña respondió. Tomando control como master.');
          this.tomarControlComoPestanaMaestra();
          resolve(true);
        }
      }, 180);
    });
  }

  private limpiarRegistroAlCerrar() {
    if (this.channel && !this.isBloqueada) {
      try {
        const masterId = localStorage.getItem(STORAGE_MASTER_KEY);
        if (masterId === this.tabId) {
          localStorage.removeItem(STORAGE_MASTER_KEY);
          localStorage.removeItem(STORAGE_HEARTBEAT_KEY);
          this.channel.postMessage({
            type: 'MASTER_TAB_CLOSED',
            senderTabId: this.tabId,
            timestamp: Date.now(),
          });
        }
      } catch {
        // ignore
      }
    }
    this.detenerHeartbeat();
  }
}
