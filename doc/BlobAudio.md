# BlobAudio

Component for playing back a captured audio

## Syntax

```js
  const { blob } = capturedAudio;
  return <BlobAudio srcObject={blob}>
```

## Props

* `srcObject` - `<Blob>` Blob containing a captured audio segment

## Notes

Component also accepts props appropriate for an `<audio>` element.