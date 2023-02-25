import { useRef, useEffect, useMemo, createElement } from 'react';

export function BlobAudio(props) {
  const { srcObject, ...remaining } = props;
  const src = useBlobURL(srcObject);
  return createElement('audio', { src, ...remaining });
}

export function BlobImage(props) {
  const { srcObject, ...remaining } = props;
  const src = useBlobURL(srcObject);
  return createElement('img', { src, ...remaining });
}

export function BlobVideo(props) {
  const { srcObject, ...remaining } = props;
  const src = useBlobURL(srcObject);
  return createElement('video', { src, ...remaining });
}

export function StreamVideo(props) {
  const { srcObject, ...remaining } = props;
  const ref = useRef();
  useEffect(() => {
    const video = ref.current;
    video.srcObject = srcObject;
    if (srcObject) {
      video.play();
    }  
  }, [ srcObject ]);
  return createElement('video', { ref, ...remaining });
}

function useBlobURL(srcObject) {
  const url = useMemo(() => URL.createObjectURL(srcObject), [ srcObject ]);
  useEffect(() => {
    return () => URL.revokeObjectURL(url);
  }, [ url ]);
  return url;
}