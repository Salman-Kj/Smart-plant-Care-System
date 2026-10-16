/**
 * Utility to cleanup stuck overlays and restore pointer events
 */
export function cleanupStuckOverlays() {
  // Restore body pointer events and classes
  document.body.style.pointerEvents = "auto";
  document.documentElement.style.pointerEvents = "auto";
  document.body.style.overflow = "";
  document.body.style.overflowX = "";
  document.body.style.overflowY = "";
  document.body.classList.remove("modal-open", "overflow-hidden", "overflow-x-hidden", "overflow-y-hidden");
  document.body.removeAttribute("data-scroll-locked");
  document.body.removeAttribute("data-modal-open");

  // Remove only actual overlay/backdrop elements (not page content)
  const overlaySelectors = [
    '[data-radix-overlay][data-state="closed"]',
    '[data-radix-dialog-overlay][data-state="closed"]',
    '[data-radix-sheet-overlay][data-state="closed"]',
    '[data-radix-drawer-overlay][data-state="closed"]',
    '[data-radix-alert-dialog-overlay][data-state="closed"]',
  ];

  overlaySelectors.forEach((selector) => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        // Only remove if it's actually closed and is an overlay
        if (htmlEl.getAttribute('data-state') === 'closed' && 
            (htmlEl.hasAttribute('data-radix-overlay') || 
             htmlEl.classList.toString().includes('bg-black/80') ||
             htmlEl.classList.toString().includes('bg-black/50'))) {
          htmlEl.remove();
        }
      });
    } catch (e) {
      // Ignore errors
    }
  });

  // Remove only blocking overlays with fixed position, high z-index, and closed state
  try {
    const fixedDivs = document.querySelectorAll('div[data-radix-overlay], div[data-radix-dialog-overlay], div[data-radix-sheet-overlay]');
    fixedDivs.forEach((div) => {
      const htmlDiv = div as HTMLElement;
      const computedStyle = window.getComputedStyle(htmlDiv);
      const state = htmlDiv.getAttribute('data-state');
      
      // Only remove if it's a Radix overlay, closed, and has backdrop styling
      if (
        state === 'closed' &&
        htmlDiv.hasAttribute('data-radix-overlay') &&
        computedStyle.position === 'fixed' &&
        computedStyle.zIndex &&
        parseInt(computedStyle.zIndex) >= 40 &&
        (computedStyle.backgroundColor.includes('black') || computedStyle.opacity === '0')
      ) {
        htmlDiv.remove();
      }
    });
  } catch (e) {
    // Ignore errors
  }

  // Only remove Radix portals that contain closed overlays (not all portals)
  try {
    const portals = document.querySelectorAll('[data-radix-portal]');
    portals.forEach((portal) => {
      const hasOpenContent = portal.querySelector('[data-state="open"]');
      const hasClosedOverlay = portal.querySelector('[data-radix-overlay][data-state="closed"]');
      // Only remove if it has a closed overlay and no open content
      if (hasClosedOverlay && !hasOpenContent) {
        portal.remove();
      }
    });
  } catch (e) {
    // Ignore errors
  }
}

// Auto-cleanup on page visibility change
if (typeof window !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      cleanupStuckOverlays();
    }
  });

  // Cleanup on focus
  window.addEventListener('focus', cleanupStuckOverlays);

  // Emergency cleanup on click if body has pointer-events: none
  document.addEventListener('click', (e) => {
    const bodyStyle = window.getComputedStyle(document.body);
    if (bodyStyle.pointerEvents === 'none') {
      cleanupStuckOverlays();
      // Retry the click after cleanup
      setTimeout(() => {
        const target = e.target as HTMLElement;
        if (target && target.click) {
          target.click();
        }
      }, 10);
    }
  }, { capture: true });
}
