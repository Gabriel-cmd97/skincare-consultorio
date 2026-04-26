import { EstadoPiel } from '../value-objects/EstadoPiel';

export class Paciente {
  constructor(
    public readonly id: string,
    public nombre: string,
    public apellidos: string,
    public fechaNacimiento: Date,
    public telefono: string,
    public email?: string,
    public motivoConsultaPrincipal?: string,
    // La historia médica detallada podría ser otro Value Object
    public alergias: string[] = []
  ) {}

  public getNombreCompleto(): string {
    return `${this.nombre} ${this.apellidos}`;
  }

  public getEdad(): number {
    const hoy = new Date();
    let edad = hoy.getFullYear() - this.fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - this.fechaNacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < this.fechaNacimiento.getDate())) {
      edad--;
    }
    return edad;
  }
}
