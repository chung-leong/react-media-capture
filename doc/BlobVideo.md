# BlobVideo

Component for playing back a captured video

## Syntax

```js
  const { blob } = capturedVideo;
  return <BlobVideo srcObject={blob}>
```

## Props

* `srcObject` - `<Blob>` Blob containing a captured video segment

## Notes

Component also accepts props appropriate for a `<video>` element.