// content_script.js
range.selectNodeContents(el);
range.collapse(false);
sel.removeAllRanges();
sel.addRange(range);
}
document.execCommand('insertText', false, ch);
} else {
// input or textarea
const start = el.selectionStart ?? el.value.length;
const end = el.selectionEnd ?? start;
const value = el.value;
const newValue = value.slice(0, start) + ch + value.slice(end);
el.value = newValue;
const pos = start + 1;
el.selectionStart = el.selectionEnd = pos;
el.focus();
el.dispatchEvent(new Event('input', { bubbles: true }));
}
} else {
// generic fallback: append text
el.textContent = (el.textContent || '') + ch;
el.dispatchEvent(new InputEvent('input', { bubbles: true }));
}
}


// message listener
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
if (msg && msg.type === 'ENTER_SELECT_MODE') {
enterSelectionMode();
sendResponse({ ok: true });
}
if (msg && msg.type === 'TYPE_TEXT') {
const { text, speed } = msg;
chrome.storage.local.get(['lastSelectedSelector'], async data => {
const selector = data.lastSelectedSelector;
if (!selector) {
sendResponse({ ok: false, error: 'No target selected' });
return;
}
const mapping = { slow: 120, medium: 60, fast: 20 };
const delay = (mapping[speed] || 60);
try {
await typeTextIntoSelector(selector, text, { delay, jitter: Math.round(delay * 0.4) });
sendResponse({ ok: true });
} catch (err) {
sendResponse({ ok: false, error: err.message });
}
});
// return true to indicate we will respond asynchronously
return true;
}
if (msg && msg.type === 'STOP_TYPING') {
typingController.stopped = true;
sendResponse({ ok: true });
}
});
