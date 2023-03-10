# React-media-capture ![ci](https://img.shields.io/github/actions/workflow/status/chung-leong/react-media-capture/node.js.yml?branch=main&label=Node.js%20CI&logo=github) ![nycrc config on GitHub](https://img.shields.io/nycrc/chung-leong/react-media-capture)

React-media-capture is a library that helps you build components for capturing 
audio, video, or image using the 
[Media Capture API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API). 
It provides a hook that handles the nitty-gritty of the capture process, as well as a set of 
utility components. From your end, you only need to provide the user interface.

The library makes use of [react-seq](https://github.com/chung-leong/react-ansi-animation#readme). 
It is designed for React 18 and above.

## Installation

```sh
npm install --save-dev react-media-capture
```

## Basic usage

### Recording video 

```js
import { BlobVideo, StreamVideo, useMediaCapture } from 'react-media-capture';

function VideoDialogBox({ onClose, onCapture }) {
  const {
    status,
    liveVideo,
    capturedVideo,
    devices,
    duration,
    volume,
    selectedDeviceId,
    lastError,

    record,
    pause,
    resume,
    stop,
    clear,
    selectDevice,
  } = useMediaCapture({ watchVolume: true });

  function renderContent() {
    switch(status) {
      case 'acquiring':
        return <div>Please wait...</div>;
      case 'denied':
        return <div>No camera</div>;
      case 'previewing':
      case 'recording':
      case 'paused':
        return <StreamVideo srcObject={liveVideo.stream} muted />;
      case 'recorded':
        return <BlobVideo srcObject={capturedVideo.blob} controls />;
      default:
    }
  }
  /* ... */
}
```

### Recording audio 

import { BlobAudio, useMediaCapture } from 'react-media-capture';

```js
function AudioDialogBox({ onClose, onCapture }) {
  const {
    status,
    capturedAudio,
    devices,
    duration,
    volume,
    selectedDeviceId,
    lastError,

    record,
    pause,
    resume,
    stop,
    clear,
    selectDevice,
  } = useMediaCapture({ video: false, watchVolume: true });

  function renderContent() {
    switch(status) {
      case 'previewing':
      case 'recording':
      case 'paused':

      case 'acquiring':
        return <div>Please wait...</div>;
      case 'denied':
        return <div>No microphone</div>;
      case 'recorded':
        return <BlobAudio srcObject={capturedAudio.blob} controls />;
      default:
    }
  }
```

### Taking picture

import { BlobImage, useMediaCapture } from 'react-media-capture';

```js
function PhotoDialogBox({ onClose, onCapture }) {
  const {
    status,
    liveVideo,
    capturedImage,
    devices,
    selectedDeviceId,
    lastError,

    snap,
    clear,
    selectDevice,
  } = useMediaCapture({ watchVolume: false });

  function renderContent() {
    switch(status) {
      case 'acquiring':
        return <div>Please wait...</div>;
      case 'denied':
        return <div>No camera</div>;
      case 'previewing':
      case 'recording':
      case 'paused':
        return <StreamVideo srcObject={liveVideo.stream} muted />;
      case 'recorded':
        return <BlobImage srcObject={capturedImage.blob} controls />;
      default:
    }
  }
  /* ... */
}
```

## Monitoring volume

When the option `watchVolume` is true, `useMediaCapture` will monitor the audio volume. This allows
you to draw a volume indicator that responds to the user's voice, letting him know that his 
microphone is working correctly: 

```js
  function renderVolumeBar() {
    const top = -10, bottom = -90;
    const frac = Math.min(1, Math.max(0, (volume - bottom) / (top - bottom)));
    const percent = Math.round(frac * 100) + '%';
    return (
      <div className="volume-indicator">
        <div className="bar" style={{ width: percent }} />
      </div>
    );
  }
```

The state variable `volume` is in decibel. It varies from -90 or so (a quiet room) to -10 (very loud).

## API Reference

* [`useMediaCapture`](./doc/useMediaCapture.md#useMediaCapture)
* [`BlobAudio`](./doc/BlobAudio.md#BlobAudio)
* [`BlobImage`](./doc/BlobImage.md#BlobImage)
* [`BlobVideo`](./doc/BlobVideo.md#BlobVideo)
* [`StreamVideo`](./doc/StreamVideo.md#StreamVideo)
