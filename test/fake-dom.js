export async function withFakeDOM(cb) {
  try {
    const navigator = new EventTarget();
    global.navigator = navigator;

    const window = new EventTarget();
    global.window = window;
    cb();
  } finally {
    delete global.window;
  }
}