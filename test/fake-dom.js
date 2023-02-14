export async function withFakeDOM(cb) {
  try {
    const navigator = new EventTarget();
    global.navigator = navigator;

    const window = new EventTarget();
    global.window = window;

    const mediaDevices = new EventTarget();
    mediaDevices.devices = [];
    mediaDevices.enumerateDevices = async function() {
      return this.devices;
    };
    navigator.mediaDevices = mediaDevices;

    const permissions = new Object();
    permissions.camera = new EventTarget();
    permissions.microphone = new EventTarget();
    permissions.query = async function({ name }) {
      return this[name];
    };
    navigator.permissions = permissions;

    await cb();
  } finally {
    delete global.window;
  }
}