# useMediaCapture(options = {})

## Syntax

```js
function Widget() {
  const {
    status,
    liveVideo,
    capturedVideo,
    devices,
    selectedDeviceId,

    record,
    pause,
    resume,
    stop,
    selectDevice
  } = useMediaCapture({ watchVolume: true });
  /* ... */
}
```

## Parameters 

* `options` - `<Object>`
* `return` `{ ...state, ...methods }`

## Options

* `active` - `<booleab>` Whether the hook is active (default: `true`)
* `video` - `<boolean>` Whether video input is desired (default: `true`)
* `audio` - `<boolean>` Whether audio input is desired (default: `true`)
* `watchVolume` - `<boolean>`
* `preferredDevice` - `<string>` Which camera to use on devices with more than one 
(default: `"front"`)
* `selectNewDevice` - `<boolean>` Select newly plugged-in camera automatically 
(default: `true`)

## State variables

* `status` - `<string>` The current status, which can be one of the following:
  * "pending" - `active` is false and the hook is not doing anything.
  * "acquiring" - The hook is trying to obtain access to a camera (and/or microphone).
  * "previewing" - The hook has acquired a media stream and is awaiting user action.
  * "recording" - The hook is recording the current input.
  * "recorded" - The hook has recorded a video or audio clip or has captured an image.
  * "denied" - The user has turned down the request to use the camera, or one isn't 
  available. 
* `duration` - `<number>` The current duration of the video or audio
* `volume` - `<number>` The current volume picked up by the microphone
* `liveVideo` - `<Object>` A live video stream, with the following properties:
  * `stream`: `<MediaStream>`
  * `width`: `<number>`
  * `height`: `<number>`
* `liveAudio` - `<Object>` A live audio stream, with the following properties:
  * `stream`: `<MediaStream>`
* `capturedVideo` - `<Object>` A captured video, with the following properties
  * `blob`: `<Blob>`
  * `width`: `<number>`
  * `height`: `<number>`
* `capturedAudio` - `<Object>` A captured audio, with the following properties:
  * `blob`: `<Blob>`
* `capturedImage` - `<Object>` A captured image, with the following properties
  * `blob`: `<Blob>`
  * `width`: `<number>`
  * `height`: `<number>`
* `devices` - `<Object[]>` List of available cameras (or microphones when `video` is false),
each with the following properties:
  * `id`: `<string>`
  * `label`: `<string>`
* `selectedDeviceId` - `<string>` ID of the currently selected camera
* `lastError` - `<Error>` The last error encountered by the hook

## Methods

* `snap()`
* `record(options)`
* `pause()`
* `stop()`
* `resume()`
* `clear()`
* `selectDevice(deviceId)`
