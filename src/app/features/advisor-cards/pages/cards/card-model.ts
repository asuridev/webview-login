export interface Card {
  readonly id: string;
  /** Etiqueta/pill superior de la card (Figma node 12286-272307). */
  readonly tag: string;
  /** Título de la card. */
  readonly title: string;
  /** Texto del botón de acción. */
  readonly ctaLabel: string;
}

/**
 * Contenido visual de las cards según el diseño Figma ("BO Experiencia Modular",
 * node 12286-272307). El número y las etiquetas vienen de Figma (CLAUDE.md §6),
 * no de las specs. El destino de navegación es el mismo para todas en esta
 * iteración (gap CLAUDE.md §9: el `moduleId` por card aún no existe en el
 * `MODULE_CATALOG` de transversal).
 */
export const CARDS: readonly Card[] = [
  { id: 'seguro-tradicional', tag: 'A tu medida', title: 'Seguro Tradicional', ctaLabel: 'Ver ahora' },
  { id: 'seguro-modular', tag: 'Plan estándar', title: 'Seguro Modular', ctaLabel: 'Ver ahora' },
  { id: 'como-voy', tag: 'Tus avances', title: '¿Cómo voy?', ctaLabel: 'Ver ahora' },
  { id: 'portal-medico', tag: 'Tus avances', title: 'Portal Medico', ctaLabel: 'Ver ahora' },
];
