/**
 * Popup JavaScript
 * Handles popup functionality and displays statistics
 */

document.addEventListener('DOMContentLoaded', function() {
  loadStatistics();
  loadRecentProducts();
  setupEventListeners();
});

function loadStatistics() {
  chrome.storage.local.get(['localCount', 'totalCount'], function(data) {
    document.getElementById('localCount').textContent = data.localCount || 0;
    document.getElementById('totalCount').textContent = data.totalCount || 0;
  });
}

function loadRecentProducts() {
  chrome.storage.local.get(['recentProducts'], function(data) {
    const products = data.recentProducts || [];
    const container = document.getElementById('recentProducts');
    
    if (products.length === 0) {
      container.innerHTML = '<p class="empty">No local products found yet. Visit supported e-commerce sites!</p>';
      return;
    }
    
    container.innerHTML = products.map(product => `
      <div class="product-item">
        <div class="product-flag">${product.flag}</div>
        <div class="product-info">
          <div class="product-title">${product.title}</div>
          <div class="product-meta">
            <span class="product-origin">${product.origin}</span>
            <span class="product-retailer">${product.retailer}</span>
          </div>
        </div>
      </div>
    `).join('');
  });
}

function setupEventListeners() {
  document.getElementById('refreshBtn').addEventListener('click', function() {
    loadStatistics();
    loadRecentProducts();
  });
  
  document.getElementById('optionsBtn').addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
  });
  
  document.getElementById('reportIssue').addEventListener('click', function(e) {
    e.preventDefault();
    chrome.tabs.create({url: 'https://github.com/Wsh7Ash/tasdeer-export-badge/issues'});
  });
}
