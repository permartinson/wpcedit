// Keyboard and focus handling for the modal windows (BaseModal and
// AlertDialog), so that they work with the keyboard and screen readers:
// - when a window opens, focus moves into it, and the page behind it is made
//   inert, so that neither Tab nor a screen reader reaches it
// - Tab and Shift+Tab go round inside the window
// - when it closes, focus goes back to where it was, e.g. the image in a list
//
// The windows are moved to <body> with <Teleport>, so that they are not
// inside #app, which is the part that is made inert.

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

// How many windows are open, as the page must stay inert until the last closes
let openWindows = 0;

export function focusableIn(container) {
  return [...container.querySelectorAll(focusableSelector)].filter((element) => element.getClientRects().length > 0);
}

// Call when a window has opened. Returns the element to give focus back to.
export function openModal(container) {
  const returnTo = document.activeElement;
  openWindows++;
  document.getElementById('app')?.setAttribute('inert', '');
  const first = container.querySelector('[data-autofocus]') ?? focusableIn(container)[0] ?? container;
  first.focus();
  return returnTo;
}

// Call when a window has closed, with what openModal returned
export function closeModal(returnTo) {
  openWindows = Math.max(0, openWindows - 1);
  if (openWindows === 0) {
    document.getElementById('app')?.removeAttribute('inert');
  }
  if (returnTo?.isConnected) {
    returnTo.focus();
  }
}

// Keeps Tab inside the window: from the last element to the first, and back
export function keepTabInside(event, container) {
  if (event.key !== 'Tab') {
    return;
  }
  const elements = focusableIn(container);
  if (elements.length === 0) {
    event.preventDefault();
    return;
  }
  const first = elements[0];
  const last = elements[elements.length - 1];
  if (event.shiftKey && (document.activeElement === first || !container.contains(document.activeElement))) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (document.activeElement === last || !container.contains(document.activeElement))) {
    event.preventDefault();
    first.focus();
  }
}

// True when the arrow keys belong to the focused element (a field or a
// select), so that they must not step between images
export function arrowKeysAreTaken(event) {
  const element = event.target;
  return element instanceof HTMLElement && element.matches('input:not([type=checkbox]), select, textarea');
}
