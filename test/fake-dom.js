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
    this.screen = new Screen();

    this.fetch = fetch;
    this.Blob = Blob;
    this.MediaRecorder = MediaRecorder;
    this.AudioContext = AudioContext;
    this.AudioWorkletNode = AudioWorkletNode;
    this.HTMLCanvasElement = HTMLCanvasElement;
    this.HTMLVideoElement = HTMLVideoElement;
  }
}

class Screen extends EventTarget {
  constructor() {
    super();
    this.orientation = new ScreenOrientation();
  }
}

class ScreenOrientation extends EventTarget {
  constructor() {
    super();
    this.angle = 0;
    this.type = 'langscape-primary';
  }

  rotate(angle = 90) {
    this.angle = (this.angle + angle) % 360;
    this.type = `${(this.angle % 180) ? 'portrait' : 'landscape'}-primary`;
    this.dispatchEvent(new Event('change'));
    window.dispatchEvent(new Event('resize')); 
  }
}

class Document extends EventTarget {
  createElement(tagName) {
    if (tagName.toUpperCase() === 'VIDEO') {
      return new HTMLVideoElement();
    } else if (tagName.toUpperCase() === 'CANVAS') {
      return new HTMLCanvasElement();
    }
  }
}

class HTMLVideoElement extends EventTarget {
  constructor() {
    super();
    this.playing = false;
    this.loaded = false;
    this.srcObject = null;
  }

  get videoWidth() {
    if (!this.loaded) {
      return 0;
    } else {
      if (screen.orientation.angle % 180 === 0) {
        return 640;
      } else {
        return 350;
      }
    }
  }

  get videoHeight() {
    if (!this.loaded) {
      return 0;
    } else {
      if (screen.orientation.angle % 180 === 0) {
        return 350;
      } else {
        return 640;
      }  
    }
  }

  play() {
    if (this.srcObject) {
      setTimeout(() => {
        try {
          this.srcObject.tap();
          this.loaded = true;
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

class HTMLCanvasElement extends EventTarget {
  constructor() {
    super();
  }

  getContext(type) {
    if (type === '2d') {
      return new CanvasRenderingContext2D();
    }
  }

  toBlob(cb, mimeType, quality) {
    setTimeout(() => cb({ type: 'blob', mimeType, quality }), 0);
  }

  toDataURL() {
    return 'data://';
  }
}

function fetch(url) {
  if (url === 'data://') {
    return {
      async blob() {
        return { type: 'blob' }
      }
    }
  } 
}

class CanvasRenderingContext2D {
  drawImage() {
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
    this.allow = true;
    this.granted = false;
    this.hideDevices = false;
  }

  async enumerateDevices() {
    if (this.hideDevices) {
      return [];
    }
    return this.devices.map((device) => {
      if (this.granted) {
        return device;
      } else {
        // no label until getUserMedia() is called
        return { ...device, label: '' };
      }
    });
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
    if (!this.allow) {
      throw new Error('Permission denied');
    }
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
      this.granted = true;
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

  tap() {
    for (const track of this.tracks) {
      track.tap();
    }
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

  tap() {
    if (this.device.defective) {
      throw new Error('Device is defective');
    }
  }
}

class MediaRecorder extends EventTarget {
  constructor(stream, options) {
    super();
    this.stream = stream;
    this.options = options;
    this.recording = false;
    this.paused = false;
    this.stream.onData = (data) => {
      const evt = new Event('dataavailable');
      evt.data = data;
      this.dispatchEvent(evt);
    };
  }

  start(segment) {
    this.segment = segment;
    this.recording = true;
    setTimeout(() => {
      const evt = new Event('start');
      this.dispatchEvent(evt);
    }, 0);
  }

  stop() {
    this.recording = false;
    setTimeout(() => {
      const evt = new Event('stop');
      this.dispatchEvent(evt);
    }, 0);
  }

  pause() {
    this.recording = false;
    this.paused = true;
    setTimeout(() => {
      const evt = new Event('pause');
      this.dispatchEvent(evt);
    }, 0);
  }

  resume() {
    this.recording = true;
    this.paused = false;
    setTimeout(() => {
      const evt = new Event('resume');
      this.dispatchEvent(evt);
    }, 0);
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

class AudioContext {
  constructor() {
    this.audioWorklet = new AudioWorklet();
  }

  async resume() {    
  }

  close() {   
  }

  createMediaStreamSource(stream) {
    return new MediaStreamAudioSourceNode(stream);
  }
}

class AudioWorkletNode {
  constructor(context, name) {
    this.context = context;
    this.name = name;
    this.channel = new MessageChannel();
    this.port = this.channel.port1;
  }

  onData(data) {
    if (this.name === 'volume-monitor') {
      this.channel.port2.postMessage({ volume: data.volume });
    }
  }
}

class AudioWorklet {
  constructor() {
    this.modules = [];
  }

  addModule(url) {
    this.modules.push(url);
  }
}

class MediaStreamAudioSourceNode {
  constructor(stream) {
    this.stream = stream;
    stream.onData = (data) => this.onData?.(data);
  }

  connect(destination) {
    this.onData = (data) => destination.onData?.(data);
  }

  disconnect(destination) {
    this.onData = undefined;
  }
}

class Blob {
  constructor(list, meta) {
    this.list = list;
    this.meta = meta;
  }
}