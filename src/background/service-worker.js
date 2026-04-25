/**
 * Background Service Worker
 * Handles extension background tasks and storage
 */

// Initialize storage on install
chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.set({
    localCount: 0,
    totalCount: 0,
    recentProducts: []
  });
  
  console.log('Tasdeer Export Badge installed');
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === 'product_detected') {
    handleProductDetection(request.data, sender.tab);
  }
});

function handleProductDetection(data, tab) {
  chrome.storage.local.get(['localCount', 'totalCount', 'recentProducts'], function(storage) {
    const localCount = (storage.localCount || 0) + 1;
    const totalCount = (storage.totalCount || 0) + 1;
    
    // Add to recent products
    const recentProducts = storage.recentProducts || [];
    recentProducts.unshift({
      title: data.product.title,
      origin: data.detection.originName,
      flag: data.badge.flag,
      retailer: new URL(tab.url).hostname,
      url: tab.url,
      timestamp: Date.now()
    });
    
    // Keep only last 20 products
    if (recentProducts.length > 20) {
      recentProducts.pop();
    }
    
    // Update storage
    chrome.storage.local.set({
      localCount: localCount,
      totalCount: totalCount,
      recentProducts: recentProducts
    });
    
    // Show notification for first local product
    if (storage.localCount === 0) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Local Product Found!',
        message: `Found a product made in ${data.detection.originName}`,
        priority: 2
      });
    }
  });
}

// Handle badge clicks
chrome.action.onClicked.addListener(function(tab) {
  chrome.tabs.sendMessage(tab.id, {action: 'toggle'});
});
