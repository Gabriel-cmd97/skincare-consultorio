export class EstadoPiel {
  constructor(
    public readonly hidratacion: 'baja' | 'media' | 'alta',
    public readonly elasticidad: 'baja' | 'media' | 'alta',
    public readonly fototipo: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI',
    public readonly sensibilidad: boolean
  ) {}

  // En DDD, los Value Objects son inmutables. 
  // Cualquier cambio genera un nuevo Value Object.
  public equals(other: EstadoPiel): boolean {
    return (
      this.hidratacion === other.hidratacion &&
      this.elasticidad === other.elasticidad &&
      this.fototipo === other.fototipo &&
      this.sensibilidad === other.sensibilidad
    );
  }
}
