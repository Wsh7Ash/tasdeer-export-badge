/**
 * Amazon Content Script
 * Scrapes product data from Amazon.sa and Amazon.ae
 */

// Import shared utilities
const detector = new ProductDetector();
const badgeRenderer = new BadgeRenderer();

// Amazon selectors
const selectors = {
  productTitle: '#productTitle',
  brand: '#bylineInfo',
  price: '.a-price-whole',
  origin: '#productDetails_detailBullets_sections1',
  asin: '#ASIN'
};

function extractProductData() {
  return {
    title: document.querySelector(selectors.productTitle)?.textContent?.trim(),
    brand: extractBrand(),
    description: extractDescription(),
    price: extractPrice(),
    asin: document.querySelector(selectors.asin)?.value,
    countryOfOrigin: extractOrigin()
  };
}

function extractBrand() {
  const brandElement = document.querySelector(selectors.brand);
  if (brandElement) {
    const text = brandElement.textContent;
    const match = text.match(/Brand:\s*(.+)/);
    if (match) {
      return match[1].trim();
    }
  }
  return null;
}

function extractDescription() {
  const bulletsSection = document.querySelector('#feature-bullets ul');
  if (bulletsSection) {
    return bulletsSection.textContent;
  }
  return null;
}

function extractPrice() {
  const priceElement = document.querySelector('.a-price .a-offscreen');
  if (priceElement) {
    const priceText = priceElement.textContent;
    return parseFloat(priceText.replace(/[^0-9.]/g, ''));
  }
  return null;
}

function extractOrigin() {
  // Look for country of origin in product details
  const detailsSection = document.querySelector('#productDetails_detailBullets_sections1');
  if (detailsSection) {
    const text = detailsSection.textContent;
    const originMatch = text.match(/Country of Origin[:\s]+([A-Za-z\s]+)/i);
    if (originMatch) {
      return originMatch[1].trim();
    }
  }
  return null;
}

function findProductElement() {
  // Main product container
  return document.querySelector('#centerCol') || document.querySelector('#productTitle')?.parentElement;
}

function main() {
  // Wait for page to fully load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
    return;
  }

  // Extract product data
  const productData = extractProductData();
  
  if (!productData.title) {
    return; // Not a product page
  }

  // Detect product origin
  const detection = detector.detectProductOrigin(productData);
  
  if (!detection.isLocal || detection.origin === 'unknown') {
    return; // Not a local product
  }

  // Get badge data
  const badgeData = detector.getBadgeData(detection);
  
  if (badgeData) {
    // Find product element and render badge
    const productElement = findProductElement();
    if (productElement) {
      badgeRenderer.renderBadge(productElement, badgeData);
      
      // Send data to background script for storage
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

// Run main function
main();
