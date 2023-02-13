import { expect } from 'chai';
import { createElement } from 'react';
import { withTestRenderer } from './test-renderer.js';
import { withFakeDOM } from './fake-dom.js';

import {
  useMediaCapture,
} from '../index.js';

describe('Hooks', function() {
  describe('#useMediaCapture', function() {
    it('should not throw error when there is not DOM', async function() {
      await withTestRenderer(async ({ render }) => {
        let state;
        function Test() {
          state = useMediaCapture({
            video: true,
          });
          return null;
        }
      });
    })
    it('should work with fake DOM', async function() {
      await withFakeDOM(async () => {
        await withTestRenderer(async ({ render }) => {
          let state;
          function Test() {
            state = useMediaCapture({
              video: true,
            });
            return null;
          }
        }); 
      });
    })
  })
})