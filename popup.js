window.addEventListener('DOMContentLoaded', () => {
  const clickEl      = document.getElementById('count');
  const switchEl     = document.getElementById('tabSwitchCount');
  const reset  = document.getElementById('reset');
  const pageTypeEl   = document.getElementById('pageType');
  const timerEl      = document.getElementById('timer');


  // load both counters
  chrome.storage.local.get(
    { clickCount: 0, tabSwitchCount: 0, pageType: 'Unknown', timer: { state: 'Work', remaining: 0 } },
    ({ clickCount, tabSwitchCount, pageType, timer }) => {
      clickEl.textContent    = clickCount;
      switchEl.textContent   = tabSwitchCount;
      pageTypeEl.textContent = 'Page Type: ' + pageType;
      timerEl.textContent    = `Timer: ${timer.state} - ${formatTime(timer.remaining)}`;
    }
  );

  // reset everything (clicks + tab‐switches + badge)
  reset.addEventListener('click', () => {
    chrome.storage.local.set(
      { clickCount: 0, tabSwitchCount: 0 },
      () => {
        clickEl.textContent    = '0';
        switchEl.textContent   = '0';
        chrome.action.setBadgeText({ text: '0' });
      }
    );
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
      if (changes.clickCount) {
        clickEl.textContent = changes.clickCount.newValue;
      }
      if (changes.tabSwitchCount) {
        switchEl.textContent = changes.tabSwitchCount.newValue;
      }
      if (changes.pageType) {
        pageTypeEl.textContent = 'Page Type: ' + changes.pageType.newValue;
      }
      if (changes.timer) {
        const { state, remaining } = changes.timer.newValue;
        timerEl.textContent = `Timer: ${state} - ${formatTime(remaining)}`;
      }
    }
    });
});

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}