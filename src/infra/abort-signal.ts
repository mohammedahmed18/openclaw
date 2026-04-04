const signalPromises: WeakMap<AbortSignal, Promise<void>> = new WeakMap();
export async function waitForAbortSignal(signal?: AbortSignal): Promise<void> {
  if (!signal || signal.aborted) {
    return;
  }

  let p = signalPromises.get(signal);
  if (!p) {
    p = new Promise<void>((resolve) => {
      const onAbort = () => {
        signal.removeEventListener("abort", onAbort);
        signalPromises.delete(signal);
        resolve();
      };
      signal.addEventListener("abort", onAbort, { once: true });
    });
    signalPromises.set(signal, p);
  }

  await p;
}
