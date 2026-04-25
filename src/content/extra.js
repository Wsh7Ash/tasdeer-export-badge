/**
 * Extra Content Script
 * Scrapes product data from Extra.com
 */

const detector = new ProductDetector();
const badgeRenderer = new BadgeRenderer();

function extractProductData() {
  return {
    title: document.querySelector('.product-name')?.textContent?.trim(),
    brand: document.querySelector('.brand-name')?.textContent?.trim(),
    description: document.querySelector('.product-description')?.textContent?.trim(),
    price: extractPrice()
  };
}

function extractPrice() {
  const priceElement = document.querySelector('.price-value');
  if (priceElement) {
    const priceText = priceElement.textContent;
    return parseFloat(priceText.replace(/[^0-9.]/g, ''));
  }
  return null;
}

function findProductElement() {
  return document.querySelector('.product-container') || document.querySelector('.product-page');
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
