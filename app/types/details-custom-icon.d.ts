/**
 * Optional upload for the Inner Card's own 'custom' icon (the icon above the
 * story on the details page), separate from the Cover page's customIconUrl so
 * the two pages can show different artwork - e.g. a different Bismillah.
 * Renderers fall back to customIconUrl when this is empty, so weddings that
 * already picked 'custom' for the Inner Card keep showing what they showed.
 *
 * Declared here (interface merging) rather than in useWeddingTypes.ts.
 */
import '../composables/useWeddingTypes'

declare module '../composables/useWeddingTypes' {
  interface WeddingContent {
    detailsCustomIconUrl?: string
  }
}
