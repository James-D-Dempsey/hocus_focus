chrome.runtime.onInstalled.addListener(() => {
  // initialize click count
  chrome.storage.local.set({ clickCount: 0 });
  // initialize badge text
  chrome.action.setBadgeText({ text: '0' });
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'increment') {
    chrome.storage.local.get('clickCount', (data) => {
      const count = (data.clickCount || 0) + 1;
      chrome.storage.local.set({ clickCount: count }, () => {
        chrome.action.setBadgeText({ text: count.toString() });
      });
    });
  } else if (message.type === 'metaData') {
    let pageType = 'Generic';

    // Determine page type based on meta data and (optionally) sender.tab.url
    const isVideo = message.data.some(meta =>
      meta.name.toLowerCase().includes('video') ||
      meta.content.toLowerCase().includes('video')
    );

    const isReading = message.data.some(meta =>
      meta.name.toLowerCase().includes('article') ||
      meta.content.toLowerCase().includes('article') ||
      meta.name.toLowerCase().includes('blog')
    );

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

let timerState = 'Focus'; // "Work" period or "Break"
const workDuration = 25 * 60;   // 25 minutes expressed in seconds
const breakDuration = 5 * 60;   // 5 minutes expressed in seconds
let remainingTime = workDuration;
let timerIntervalId = null;

function updateTimerStorage() {
  console.log("Updating timer storage:", timerState, remainingTime); // Debug log
  chrome.storage.local.set({
      timer: {
          state: timerState,
          remaining: remainingTime
      }
  });
}

function startTimer() {
  updateTimerStorage();
  timerIntervalId = setInterval(() => {
    remainingTime--;
    if (remainingTime <= 0) {
      // Switch timer state and reset remaining seconds
      if (timerState === 'focus') {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icon.png', // Ensure you have icon.png in your extension folder
          title: 'Work Session Complete!',
          message: 'Time to take a 5 minute break!'
        });

        timerState = 'relax';
        remainingTime = breakDuration;
      } else {
        timerState = 'focus';
        remainingTime = workDuration;
      }
    }
    updateTimerStorage();
  }, 1000);
}


startTimer();

let idleTime = 0; // Idle time in seconds
let idleIntervalId = null;

// Function to reset idle time
function resetIdleTime() {
  idleTime = 0;
  chrome.storage.local.set({ idleTime }); // Update storage
  if (idleIntervalId) {
    clearInterval(idleIntervalId); // Stop the idle timer
    idleIntervalId = null;
  }
}

// Function to start tracking idle time
function startIdleTimer() {
  if (idleIntervalId) {
    clearInterval(idleIntervalId); // Clear any existing interval
  }

  idleIntervalId = setInterval(() => {
    idleTime++;
    chrome.storage.local.set({ idleTime }); // Update storage with new idle time
  }, 1000); // Increment idle time every second
}

// Use chrome.idle API to detect user activity
chrome.idle.onStateChanged.addListener((newState) => {
  if (newState === 'active') {
    console.log('User is active. Resetting idle time.');
    resetIdleTime(); // Reset idle time when the user becomes active
  } else if (newState === 'idle') {
    console.log('User is idle. Starting idle timer.');
    startIdleTimer(); // Start tracking idle time when the user is idle
  }
});

// Initialize idle tracking
chrome.idle.setDetectionInterval(15); // Set idle detection threshold to 15 seconds