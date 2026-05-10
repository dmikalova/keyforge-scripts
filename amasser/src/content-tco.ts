/**
 * The Crucible Online Content Script
 * Monitors localStorage for the refresh token written by the TCO client when
 * the user is logged in, then forwards it to the background script.
 *
 * The new TCO UI (heroui + tailwind) no longer renders an `a#nav-Profile`
 * element, so login state is detected by the presence of `refreshToken` in
 * localStorage instead of a DOM selector.
 */

/**
 * Check if TCO sync is enabled and watch for the refresh token.
 */
chrome.storage.sync.get("syncTco", (result: { syncTco?: boolean }) => {
  if (!result.syncTco) {
    return;
  }

  let sent = false;

  const sendAuth = (auth: string): boolean => {
    if (sent) {
      return true;
    }
    sent = true;
    console.debug(`KFA: CTCO: User is logged in`);
    chrome.runtime
      .sendMessage({
        type: "AUTH",
        auth: { authTco: auth },
      })
      .catch((error: Error) => {
        console.warn(`KFA: CTCO: Error sending message: ${error}`);
      });
    return true;
  };

  const tryReadToken = (): boolean => {
    const auth = window.localStorage.getItem("refreshToken");
    if (auth === null || auth === "") {
      return false;
    }
    return sendAuth(auth);
  };

  if (tryReadToken()) {
    return;
  }

  // Poll localStorage; storage events do not fire for same-document writes.
  const intervalId = window.setInterval(() => {
    if (tryReadToken()) {
      window.clearInterval(intervalId);
    }
  }, 1000);
});
