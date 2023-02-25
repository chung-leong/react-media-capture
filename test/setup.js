import AbortController from 'abort-controller';
import EventTargetModule from 'event-target'; const EventTarget = EventTargetModule.default;

if (!global.AbortController) {
  global.AbortController = AbortController;
}
if (!global.EventTarget) {
  global.EventTarget = EventTarget;
}

global.resolve = (path) => {
  return (new URL(path, import.meta.url)).pathname;
};