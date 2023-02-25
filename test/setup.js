import AbortController from 'abort-controller';
import EventTarget from 'event-target';

if (!global.AbortController) {
  global.AbortController = AbortController;
}
if (!global.EventTarget) {
  global.EventTarget = EventTarget;
}

global.resolve = (path) => {
  return (new URL(path, import.meta.url)).pathname;
};