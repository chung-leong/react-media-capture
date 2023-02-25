import AbortController from 'abort-controller';
import { EventTarget, Event } from 'event-target-shim';
import { MessageChannelPolyfill } from 'message-port-polyfill';

if (!global.AbortController) {
  global.AbortController = AbortController;
}
if (!global.EventTarget) {
  global.EventTarget = EventTarget;
}
if (!global.Event) {
  global.Event = Event;
}
if (!global.MessageChannel) {
  global.MessageChannel = MessageChannelPolyfill;
}

global.resolve = (path) => {
  return (new URL(path, import.meta.url)).pathname;
};