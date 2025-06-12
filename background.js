chrome.runtime.onInstalled.addListener(() => {
  // initialize click count
  chrome.storage.local.set({ clickCount: 0 });
  // initialize badge text
  chrome.action.setBadgeText({ text: '0' });
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'increment') {
    console.log('[ClickCounter] Received increment message from', sender);
    // retrieve current count, increment, then update storage and badge
    chrome.storage.local.get('clickCount', data => {
      const count = (data.clickCount || 0) + 1;
      chrome.storage.local.set({ clickCount: count }, () => {
        chrome.action.setBadgeText({ text: count.toString() });
        console.log('[ClickCounter] Updated clickCount to', count);
      });
    });
  } else if (message.type === 'metaData') {
        let pageType = 'Generic';
    
    // Determine page type based on meta data and (optionally) sender.tab.url
    
    // Example: If any meta element contains "video" in its name or content, label as Video.
    const isVideo = message.data.some(meta =>
      meta.name.toLowerCase().includes('video') ||
      meta.content.toLowerCase().includes('video')
    );
    
    // Example: If any meta element indicates an article or blog, label as Reading.
    const isReading = message.data.some(meta =>
      meta.name.toLowerCase().includes('article') ||
      meta.content.toLowerCase().includes('article') ||
      meta.name.toLowerCase().includes('blog')
    );
    
    // Example: Check sender.tab.url for work-related domains if available.
    let isWork = false;
    if (sender.tab && sender.tab.url) {
      const workDomains = ['office.com', 'docs.google.com', 'github.com'];
      isWork = workDomains.some(domain => sender.tab.url.toLowerCase().includes(domain));
    }
    
    if (isWork) {
      pageType = 'Work';
    } else if (isVideo) {
      pageType = 'Video';
    } else if (isReading) {
      pageType = 'Reading';
    }
    
    chrome.storage.local.set({ pageType });
  }
});

let tabSwitchCount = 0;
// When the user switches tabs…
chrome.tabs.onActivated.addListener(activeInfo => {
  // bump your counter
  tabSwitchCount++;
  // persist it
  chrome.storage.local.set({ tabSwitchCount });
});

let timerState = 'Work'; // "Work" period or "Break"
const workDuration = 5 * 60;   // 25 minutes expressed in seconds
const breakDuration = 1 * 60;   // 5 minutes expressed in seconds
let remainingTime = workDuration;
let timerIntervalId = null;

// Update timer data in storage so popup can display it
function updateTimerStorage() {
    chrome.storage.local.set({
        timer: {
            state: timerState,
            remaining: remainingTime
        }
    });
}

// Start the timer cycle with an interval that ticks every second
function startTimer() {
    updateTimerStorage();
    timerIntervalId = setInterval(() => {
        remainingTime--;
        if (remainingTime <= 0) {
            // Switch timer state and reset remaining seconds
            if (timerState === 'Work') {
                chrome.notifications.create({
                      type: 'basic',
                      iconUrl: 'icon.png', // Ensure you have icon.png in your extension folder
                      title: 'Work Session Complete!',
                      message: 'Time to take a 5 minute break!'
                });

                timerState = 'Break';
                remainingTime = breakDuration;
            } else {
                timerState = 'Work';
                remainingTime = workDuration;
            }
        }
        updateTimerStorage();
    }, 100);
}

startTimer();


// List of blocked URLs (this can be modified or extended)
const blockedUrls = [
  "*://www.facebook.com/*",
  "*://www.twitter.com/*",
  "*://www.instagram.com/*"
];

// Listener to block requests matching a blocked URL pattern
chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    console.log("Blocking:", details.url);
    return { cancel: true };
  },
  { urls: blockedUrls },
  ["blocking"]
);
