export function calcularProgreso(isCompleted: number): number {
  const totalPasos = 5;
  return (isCompleted / totalPasos) * 100;
}
