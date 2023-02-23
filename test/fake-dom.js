export async function withFakeDOM(cb) {
  const globalVars = {
    navigator: new Navigator(),
    window: new Window(),
  };
  try {   
    for (const [ name, value ] of Object.entries(globalVars)) {
      global[name] = value;
    }
    await cb();
  } finally {
    for (const [ name, value ] of Object.entries(globalVars)) {
      delete global[name];
    }
  }
}

class Window extends EventTarget {
  constructor() {
    super();
    this.document = new Document();
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
    this.videoWidth = 0;
    this.videoHeight = 0;
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
    return this.devices.slice();
  }

  addDevice(device) {
    this.devices.push(device);
  }

  removeDevice(device) {
    const index = this.devices.indexOf(device);
    if (index !== -1) {
      this.devices.splice(index, 1);
      this.notifyChange();
    }
  }

  notifyChange() {
    const evt = new Event('devicechange');
    this.dispatchEvent(evt);
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