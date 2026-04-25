/**
 * Product Detector
 * Detects product origin and determines if it's a local Gulf product
 */

class ProductDetector {
  constructor() {
    this.gulfCountries = ['SA', 'AE', 'JO', 'BH', 'QA', 'KW', 'OM'];
    this.countryNames = {
      'SA': 'Saudi Arabia',
      'AE': 'United Arab Emirates',
      'JO': 'Jordan',
      'BH': 'Bahrain',
      'QA': 'Qatar',
      'KW': 'Kuwait',
      'OM': 'Oman'
    };
    this.countryFlags = {
      'SA': '🇸🇦',
      'AE': '🇦🇪',
      'JO': '🇯🇴',
      'BH': '🇧🇭',
      'QA': '🇶🇦',
      'KW': '🇰🇼',
      'OM': '🇴🇲'
    };
    this.localBrands = new Set([
      'saudi brand', 'saudi manufacturing', 'emirates brand', 'uae manufacturing',
      'jordan brand', 'bahrain brand', 'qatar brand', 'kuwait brand', 'oman brand'
    ]);
  }

  detectProductOrigin(productData) {
    const origin = this.extractCountryOfOrigin(productData);
    const isLocal = this.isLocalProduct(origin);
    
    return {
      origin: origin,
      originName: this.countryNames[origin] || origin,
      isLocal: isLocal,
      confidence: this.calculateConfidence(productData),
      metadata: this.extractMetadata(productData)
    };
  }

  extractCountryOfOrigin(productData) {
    // Check explicit country of origin field
    if (productData.countryOfOrigin) {
      return this.parseCountry(productData.countryOfOrigin);
    }

    // Check product description
    if (productData.description) {
      const originMatch = productData.description.match(/country of origin[:\s]+([a-z\s]+)|made in ([a-z\s]+)/i);
      if (originMatch) {
        return this.parseCountry(originMatch[1] || originMatch[2]);
      }
    }

    // Check brand for local indicators
    if (productData.brand) {
      const brandOrigin = this.detectOriginFromBrand(productData.brand);
      if (brandOrigin) {
        return brandOrigin;
      }
    }

    // Check manufacturer
    if (productData.manufacturer) {
      const manufacturerOrigin = this.detectOriginFromBrand(productData.manufacturer);
      if (manufacturerOrigin) {
        return manufacturerOrigin;
      }
    }

    return 'unknown';
  }

  parseCountry(countryString) {
    const normalized = countryString.toLowerCase().trim();
    
    // Direct country code match
    if (this.countryNames[normalized.toUpperCase()]) {
      return normalized.toUpperCase();
    }

    // Country name match
    for (const [code, name] of Object.entries(this.countryNames)) {
      if (normalized.includes(name.toLowerCase())) {
        return code;
      }
    }

    // Common variations
    const variations = {
      'saudi arabia': 'SA',
      'saudi': 'SA',
      'uae': 'AE',
      'united arab emirates': 'AE',
      'jordan': 'JO',
      'bahrain': 'BH',
      'qatar': 'QA',
      'kuwait': 'KW',
      'oman': 'OM'
    };

    if (variations[normalized]) {
      return variations[normalized];
    }

    return 'unknown';
  }

  detectOriginFromBrand(brandString) {
    const normalized = brandString.toLowerCase();
    
    for (const brandIndicator of this.localBrands) {
      if (normalized.includes(brandIndicator)) {
        // Try to determine specific country from brand
        if (normalized.includes('saudi')) return 'SA';
        if (normalized.includes('emirates') || normalized.includes('uae')) return 'AE';
        if (normalized.includes('jordan')) return 'JO';
        if (normalized.includes('bahrain')) return 'BH';
        if (normalized.includes('qatar')) return 'QA';
        if (normalized.includes('kuwait')) return 'KW';
        if (normalized.includes('oman')) return 'OM';
      }
    }

    return null;
  }

  isLocalProduct(country) {
    return this.gulfCountries.includes(country);
  }

  calculateConfidence(productData) {
    let confidence = 0.5;

    // Higher confidence if explicit country is provided
    if (productData.countryOfOrigin) {
      confidence += 0.3;
    }

    // Higher confidence if brand is known
    if (productData.brand && this.detectOriginFromBrand(productData.brand)) {
      confidence += 0.2;
    }

    return Math.min(confidence, 1.0);
  }

  extractMetadata(productData) {
    return {
      brand: productData.brand || null,
      manufacturer: productData.manufacturer || null,
      importer: productData.importer || null,
      distributor: productData.distributor || null
    };
  }

  getBadgeData(detection) {
    if (!detection.isLocal || detection.origin === 'unknown') {
      return null;
    }

    return {
      type: 'local',
      text: `Made in ${detection.originName}`,
      flag: this.countryFlags[detection.origin],
      color: this.getCountryColor(detection.origin),
      countryCode: detection.origin
    };
  }

  getCountryColor(country) {
    const colors = {
      'SA': '#00875a',
      'AE': '#1e88e5',
      'JO': '#d32f2f',
      'BH': '#e91e63',
      'QA': '#9c27b0',
      'KW': '#ff9800',
      'OM': '#4caf50'
    };
    return colors[country] || '#666666';
  }
}

// Export for use in content scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProductDetector;
}
