// content.js

console.log('[ClickCounter] injected into frame:', location.href);

document.addEventListener(
  'click',
  () => {
    console.log('[ClickCounter] click in frame:', location.href);

    if (!chrome.runtime?.sendMessage) return;

    try {
      chrome.runtime.sendMessage({ type: 'increment' });
    } catch (err) {
      // ignore “Extension context invalidated” errors
    }
  },
  true
);

window.addEventListener('load', () => {
  const metaElements = document.getElementsByTagName('meta');
  const metaData = [];
  for (const meta of metaElements) {
    const name = meta.getAttribute('name') || meta.getAttribute('property');
    const content = meta.getAttribute('content');
    if (name && content) {
      metaData.push({ name, content });
    }
  }
  console.log('[ClickCounter] Meta data:', metaData);
  
  // Optionally, send the meta data to the background script for classification.
  try {
    chrome.runtime.sendMessage({ type: 'metaData', data: metaData });
  } catch (err) {
    console.warn('[ClickCounter] Failed to send meta data:', err);
  }
});