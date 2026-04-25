/**
 * Carrefour UAE Content Script
 * Scrapes product data from Carrefour UAE
 */

const detector = new ProductDetector();
const badgeRenderer = new BadgeRenderer();

function extractProductData() {
  return {
    title: document.querySelector('[data-testid="product-title"]')?.textContent?.trim(),
    brand: document.querySelector('[data-testid="brand"]')?.textContent?.trim(),
    description: document.querySelector('[data-testid="description"]')?.textContent?.trim(),
    price: extractPrice()
  };
}

function extractPrice() {
  const priceElement = document.querySelector('[data-testid="price"]');
  if (priceElement) {
    const priceText = priceElement.textContent;
    return parseFloat(priceText.replace(/[^0-9.]/g, ''));
  }
  return null;
}

function findProductElement() {
  return document.querySelector('[data-testid="product-container"]') || document.querySelector('main');
}

function main() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
    return;
  }

  const productData = extractProductData();
  
  if (!productData || !productData.title) {
    return;
  }

  const detection = detector.detectProductOrigin(productData);
  
  if (!detection.isLocal || detection.origin === 'unknown') {
    return;
  }

  const badgeData = detector.getBadgeData(detection);
  
  if (badgeData) {
    const productElement = findProductElement();
    if (productElement) {
      badgeRenderer.renderBadge(productElement, badgeData);
      
      chrome.runtime.sendMessage({
        type: 'product_detected',
        data: {
          detection: detection,
          badge: badgeData,
          product: productData,
          url: window.location.href
        }
      });
    }
  }
}

main();
