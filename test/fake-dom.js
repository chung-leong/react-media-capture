export async function withFakeDOM(cb) {
  const window = new Window();
  try {   
    for (const [ name, value ] of Object.entries(window)) {
      global[name] = value;
    }
    await cb();
  } finally {
    for (const [ name, value ] of Object.entries(window)) {
      delete global[name];
    }
  }
}

class Window extends EventTarget {
  constructor() {
    super();
    this.window = this;
    this.document = new Document();
    this.navigator = new Navigator();
  }
}

class Document extends EventTarget {
  createElement(tagName) {
    if (tagName.toUpperCase() === 'VIDEO') {
      return new VideoElement();
    }
  }
}

class VideoElement extends EventTarget {
  constructor() {
    super();
    this.playing = false;
    this.videoWidth = 0;
    this.videoHeight = 0;
    this.srcObject = null;
  }

  play() {
    if (this.srcObject) {
      setTimeout(() => {
        try {
          this.srcObject.onPlay?.();
          this.playing = true;
          this.oncanplay?.({});  
        } catch (err) {
          this.onerror?.({ type: 'error', error: err });
        }
      }, 0);
    }
  }

  pause() {
    this.playing = false;
  }

  getTracks() {
    return this.tracks;
  }
}

class Navigator extends EventTarget {
  constructor() {
    super();
    this.mediaDevices = new MediaDevices();
    this.permissions = new Permissions();
  }
}

class MediaDevices extends EventTarget {
  constructor() {
    super();
    this.devices = [];
  }

  async enumerateDevices() {
    return this.devices.slice(0);
  }

  addDevice(info) {
    this.devices.push(new MediaDeviceInfo(info));
    this.notifyChange();
  }

  removeDevice(deviceId) {
    const index = this.devices.findIndex(d => d.deviceId === deviceId);
    if (index !== -1) {
      this.devices.splice(index, 1);
      this.notifyChange();
    }
  }

  notifyChange() {
    const evt = new Event('devicechange');
    this.dispatchEvent(evt);
  }

  async getUserMedia(constraints) {
    this.onStreamRequest?.(constraints);
    const devices = [];
    for (const [ kind, value ] of Object.entries(constraints)) {
      let device;
      if (value.deviceId) {
        device = this.devices.find(d => d.deviceId === value.deviceId);
      }
      if (!device) {
        device = this.devices.find(d => d.kind === `${kind}input`);
      }
      if (device) {
        devices.push(device);
      }
    }
    if (devices.length === 0) {
      throw new Error('Unable to find a device matching constraint');
    } else {
      const stream = new MediaStream(devices);
      this.onStreamResponse?.(stream);
      return stream;
    }
  }
}

class MediaDeviceInfo {
  constructor(info) {
    Object.assign(this, info);
  }
}

class MediaStream extends EventTarget {
  constructor(devices) {
    super();
    this.videoWidth = 0;
    this.videoHeight = 0;
    this.tracks = devices.map(device => new MediaStreamTrack(device));
  }

  getTracks() {
    return this.tracks;
  }
}

class MediaStreamTrack extends EventTarget {
  constructor(device) {
    super();
    if (device.kind === 'videoinput') { 
      this.kind = 'video';
    } else if (device.kind === 'audioinput') {
      this.kind = 'audio';
    }
    this.device = device;
    this.stopped = false;
  }

  stop() {
    this.stopped = true;
  }
}

class Permissions {
  constructor() {
    this.camera = new Status();
    this.microphone = new Status();
  }

  async query({ name }) {
    return this[name];
  }
}

class Status extends EventTarget {  
}