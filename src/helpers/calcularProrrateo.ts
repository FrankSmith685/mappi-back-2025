export const calcularProrrateo = (
  precioAnterior: number,
  fechaInicio: Date,
  fechaExpiracion: Date,
  fechaActual: Date
) => {
  // Calcular diferencia en horas desde el inicio
  const diferenciaHoras =
    (fechaActual.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60);

  // 🔹 Caso 1: comprado hace menos de 24h → descuento total
  if (diferenciaHoras < 24) {
    return { saldoRestante: precioAnterior, diasRestantes: 30 };
  }

  // 🔹 Caso 2: proporcional según días restantes
  const diasTotales = Math.ceil(
    (fechaExpiracion.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)
  );
  const diasRestantes = Math.ceil(
    (fechaExpiracion.getTime() - fechaActual.getTime()) / (1000 * 60 * 60 * 24)
  );

  const saldoRestante = parseFloat(((precioAnterior / diasTotales) * diasRestantes).toFixed(2));


  return { saldoRestante, diasRestantes };
};