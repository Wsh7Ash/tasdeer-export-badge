/**
 * Lulu Hypermarket Content Script
 * Scrapes product data from Lulu Hypermarket
 */

const detector = new ProductDetector();
const badgeRenderer = new BadgeRenderer();

function extractProductData() {
  return {
    title: document.querySelector('.product-name')?.textContent?.trim(),
    brand: document.querySelector('.product-brand')?.textContent?.trim(),
    description: document.querySelector('.product-desc')?.textContent?.trim(),
    price: extractPrice()
  };
}

function extractPrice() {
  const priceElement = document.querySelector('.price-tag');
  if (priceElement) {
    const priceText = priceElement.textContent;
    return parseFloat(priceText.replace(/[^0-9.]/g, ''));
  }
  return null;
}

function findProductElement() {
  return document.querySelector('.product-item') || document.querySelector('.product-detail');
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
