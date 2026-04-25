/**
 * Badge Renderer
 * Renders badges on product pages to highlight local products
 */

class BadgeRenderer {
  constructor() {
    this.badgeContainer = null;
  }

  renderBadge(productElement, badgeData) {
    if (!badgeData) {
      return;
    }

    // Remove existing badge if present
    this.removeBadge(productElement);

    // Create badge element
    const badge = this.createBadgeElement(badgeData);

    // Find optimal position
    const position = this.findOptimalPosition(productElement);

    // Apply positioning
    badge.style.top = position.top + 'px';
    badge.style.right = position.right + 'px';

    // Make product element relative for positioning
    productElement.style.position = 'relative';

    // Insert badge
    productElement.appendChild(badge);

    return badge;
  }

  createBadgeElement(badgeData) {
    const badge = document.createElement('div');
    badge.className = `tasdeer-badge tasdeer-badge-${badgeData.countryCode.toLowerCase()}`;
    badge.setAttribute('data-tasdee-badge', 'true');

    badge.innerHTML = `
      <span class="tasdeer-flag">${badgeData.flag}</span>
      <span class="tasdeer-text">${badgeData.text}</span>
    `;

    return badge;
  }

  findOptimalPosition(element) {
    const rect = element.getBoundingClientRect();
    const existingBadges = this.getExistingBadges(element);

    // Default position
    let position = { top: 10, right: 10 };

    // Check for existing badges and adjust position
    if (existingBadges.length > 0) {
      const lastBadge = existingBadges[existingBadges.length - 1];
      const lastBadgeRect = lastBadge.getBoundingClientRect();
      
      // Stack badges vertically
      position.top = lastBadgeRect.height + 10;
    }

    return position;
  }

  getExistingBadges(element) {
    return element.querySelectorAll('[data-tasdee-badge]');
  }

  removeBadge(productElement) {
    const existingBadge = productElement.querySelector('[data-tasdee-badge]');
    if (existingBadge) {
      existingBadge.remove();
    }
  }

  removeAllBadges() {
    const allBadges = document.querySelectorAll('[data-tasdee-badge]');
    allBadges.forEach(badge => badge.remove());
  }
}

// Export for use in content scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BadgeRenderer;
}
