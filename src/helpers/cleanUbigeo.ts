// 🔹 Función para limpiar valores vacíos/null antes de armar la query
export const cleanUbigeoParts = (parts: (string | undefined | null)[]): string[] => {
  return parts.filter(p => p && p.trim() !== "") as string[];
};