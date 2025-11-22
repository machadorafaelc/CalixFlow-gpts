/**
 * Utilitários para cores
 * 
 * Gera cores consistentes baseadas em IDs
 */

/**
 * Gera um hash numérico a partir de uma string
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Paletas de gradientes disponíveis
 */
const gradients = [
  { from: 'from-purple-500', to: 'to-pink-500', bg: 'bg-purple-500' },
  { from: 'from-blue-500', to: 'to-cyan-500', bg: 'bg-blue-500' },
  { from: 'from-green-500', to: 'to-emerald-500', bg: 'bg-green-500' },
  { from: 'from-orange-500', to: 'to-red-500', bg: 'bg-orange-500' },
  { from: 'from-indigo-500', to: 'to-purple-500', bg: 'bg-indigo-500' },
  { from: 'from-teal-500', to: 'to-green-500', bg: 'bg-teal-500' },
  { from: 'from-rose-500', to: 'to-pink-500', bg: 'bg-rose-500' },
  { from: 'from-amber-500', to: 'to-orange-500', bg: 'bg-amber-500' },
  { from: 'from-violet-500', to: 'to-fuchsia-500', bg: 'bg-violet-500' },
  { from: 'from-sky-500', to: 'to-blue-500', bg: 'bg-sky-500' },
];

/**
 * Retorna um gradiente consistente baseado no ID
 */
export function getGradientForId(id: string): string {
  const hash = hashString(id);
  const index = hash % gradients.length;
  const gradient = gradients[index];
  return `${gradient.from} ${gradient.to}`;
}

/**
 * Retorna uma cor de fundo sólida consistente baseada no ID
 */
export function getBackgroundColorForId(id: string): string {
  const hash = hashString(id);
  const index = hash % gradients.length;
  return gradients[index].bg;
}

/**
 * Gera iniciais a partir de um nome
 */
export function getInitials(name: string): string {
  const words = name.split(' ').filter(w => w.length > 0);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

/**
 * Paletas de cores com valores hexadecimais para uso em estilos inline
 */
const colorPalettes = [
  { from: '#9333ea', to: '#ec4899' }, // purple-pink
  { from: '#3b82f6', to: '#06b6d4' }, // blue-cyan
  { from: '#22c55e', to: '#10b981' }, // green-emerald
  { from: '#f97316', to: '#ef4444' }, // orange-red
  { from: '#6366f1', to: '#9333ea' }, // indigo-purple
  { from: '#14b8a6', to: '#22c55e' }, // teal-green
  { from: '#f43f5e', to: '#ec4899' }, // rose-pink
  { from: '#f59e0b', to: '#f97316' }, // amber-orange
  { from: '#8b5cf6', to: '#d946ef' }, // violet-fuchsia
  { from: '#0ea5e9', to: '#3b82f6' }, // sky-blue
];

/**
 * Retorna uma paleta de cores consistente baseada no ID
 * Retorna cores em formato hexadecimal para uso em estilos inline
 */
export function getColorPalette(id: string): { from: string; to: string } {
  const hash = hashString(id);
  const index = hash % colorPalettes.length;
  return colorPalettes[index];
}
