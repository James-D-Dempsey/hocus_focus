window.addEventListener('DOMContentLoaded', () => {
  const clickEl        = document.getElementById('count');
  const switchEl       = document.getElementById('tabSwitchCount');
  const reset          = document.getElementById('reset');
  const pageTypeEl     = document.getElementById('pageType');
  const timerEl        = document.getElementById('timer');
  const idleEl         = document.getElementById('idleTime');


   chrome.storage.local.get(
    { clickCount: 0, tabSwitchCount: 0, pageType: 'Unknown', timer: { state: 'Work', remaining: 0 }, idleTime: 0},
    ({ clickCount, tabSwitchCount, pageType, timer, idleTime}) => {
      clickEl.textContent = clickCount;
      switchEl.textContent = tabSwitchCount;
      pageTypeEl.textContent = 'Page Type: ' + pageType;
      timerEl.textContent = `Timer: ${timer.state} - ${formatTime(timer.remaining)}`;
      idleEl.textContent = `Idle Time: ${formatTime(idleTime)}`;
    }
  );

  // reset everything (clicks + tab‐switches + badge)
  reset.addEventListener('click', () => {
    chrome.storage.local.set(
      { clickCount: 0, tabSwitchCount: 0, idleTime: 0 },
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
          console.log("Click count changed:", changes.clickCount.newValue); // Debug log
          clickEl.textContent = changes.clickCount.newValue;
      }
      if (changes.tabSwitchCount) {
          console.log("Tab switch count changed:", changes.tabSwitchCount.newValue); // Debug log
          switchEl.textContent = changes.tabSwitchCount.newValue;
      }
      if (changes.timer) {
        console.log("Timer changed:", changes.timer.newValue); // Debug log
        const { state, remaining } = changes.timer.newValue;
        timerEl.textContent = `${state} - ${formatTime(remaining)}`;
      }
      if (changes.idleTime) {
          console.log("Idle time changed:", changes.idleTime.newValue); // Debug log
          const idleTime = changes.idleTime.newValue;
          idleEl.textContent = `Idle Time: ${formatTime(idleTime)}`;
      }
    }
  });
});

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}