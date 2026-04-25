/**
 * Noon Content Script
 * Scrapes product data from Noon.com
 */

const detector = new ProductDetector();
const badgeRenderer = new BadgeRenderer();

function extractProductData() {
  // Noon often stores product data in JavaScript variables
  const scriptData = extractFromPageScript();
  
  if (scriptData) {
    return {
      title: scriptData.name,
      brand: scriptData.brand,
      description: scriptData.description,
      price: scriptData.price,
      sku: scriptData.sku,
      countryOfOrigin: scriptData.countryOfOrigin
    };
  }
  
  // Fallback to DOM scraping
  return scrapeFromDOM();
}

function extractFromPageScript() {
  const scripts = document.querySelectorAll('script');
  
  for (const script of scripts) {
    const content = script.textContent;
    
    // Look for product data patterns
    const patterns = [
      /window\.__PRODUCT__\s*=\s*({.+?});/,
      /__NEXT_DATA__.*?({.+?})<\/script>/,
      /productData\s*=\s*({.+?});/
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        try {
          const data = JSON.parse(match[1]);
          return normalizeNoonData(data);
        } catch (e) {
          continue;
        }
      }
    }
  }
  
  return null;
}

function normalizeNoonData(data) {
  // Normalize different Noon data structures
  if (data.product) {
    return data.product;
  }
  if (data.props && data.props.pageProps && data.props.pageProps.product) {
    return data.props.pageProps.product;
  }
  return data;
}

function scrapeFromDOM() {
  return {
    title: document.querySelector('[data-testid="product-title"]')?.textContent?.trim(),
    brand: document.querySelector('[data-testid="brand"]')?.textContent?.trim(),
    description: document.querySelector('[data-testid="product-description"]')?.textContent?.trim(),
    price: extractPrice()
  };
}

function extractPrice() {
  const priceElement = document.querySelector('[data-testid="price-now"]');
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
