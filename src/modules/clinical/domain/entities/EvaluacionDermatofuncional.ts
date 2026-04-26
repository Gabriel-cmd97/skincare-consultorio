import { EstadoPiel } from '../value-objects/EstadoPiel';

// Tipo de condición o patología a tratar
export type CondicionTegumentaria = 
  | 'Cicatriz' 
  | 'Flacidez' 
  | 'Arrugas' 
  | 'Manchas' 
  | 'Acné' 
  | 'Rosácea' 
  | 'Celulitis' 
  | 'Grasa Localizada' 
  | 'Secuela Postquirúrgica';

export interface HallazgoClinico {
  condicion: CondicionTegumentaria;
  zonaCuerpo: string;
  severidad: 'Leve' | 'Moderada' | 'Severa';
  notasAdicionales: string;
}

export class EvaluacionDermatofuncional {
  constructor(
    public readonly id: string,
    public readonly pacienteId: string,
    public fecha: Date,
    public estadoPielBase: EstadoPiel,
    private hallazgos: HallazgoClinico[] = [],
    public fotosClinicasUrl: string[] = [],
    public objetivoPrincipal: 'Estético' | 'Funcional' | 'Mixto'
  ) {}

  public agregarHallazgo(hallazgo: HallazgoClinico): void {
    this.hallazgos.push(hallazgo);
  }

  public obtenerHallazgos(): ReadonlyArray<HallazgoClinico> {
    return Object.freeze([...this.hallazgos]);
  }

  // Lógica de negocio: Determinar si el paciente es apto para ciertas aparatologías
  public esAptoParaAparatologiaFuerte(): boolean {
    // Si la piel es muy sensible, se recomienda evitar aparatología agresiva inicialmente
    if (this.estadoPielBase.sensibilidad) {
      return false;
    }
    return true;
  }
}
