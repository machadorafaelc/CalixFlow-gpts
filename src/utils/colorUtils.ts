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
