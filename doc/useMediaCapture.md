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
* `return` `<Object>`

## Options

* `active` - `<booleab>`
* `video` - `<boolean>`
* `audio` - `<boolean>`
* `preferredDevice` - `<string>`
* `selectNewDevice` - `<boolean>`
* `watchVolume` - `<boolean>`

## Returned properties

* `status` - `<string>`
* `duration` - `<number>`
* `volume` - `<number>`
* `liveVideo` - `{ stream, width, height }`
* `liveAudio` - `{ stream }`
* `capturedVideo` - `{ blob, width, height }`
* `capturedAudio` - `{ blob }`
* `capturedImage` - `{ blob, width, height }`
* `lastError` - `<Error>`
* `devices` - `<Object[]>`
* `selectedDeviceId` - 

## Methods

* `snap`
* `record`
* `pause`
* `stop`
* `resume`
* `clear`
* `selectDevice`
