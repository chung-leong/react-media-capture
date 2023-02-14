import { expect } from 'chai';
import { createElement } from 'react';
import { delay } from 'react-seq';
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
        const el = createElement(Test);
        await render(el);
      });
    })
    it('should work with fake DOM', async function() {
      await withFakeDOM(async () => {
        await withTestRenderer(async ({ render }) => {
          let state;
          function Test() {
            try {
              state = useMediaCapture({
                video: true,
              });
              return null;
                
            } catch (err) {
              console.error(err);
            }
          }
          const el = createElement(Test);
          await render(el);
        }); 
      });      
    })
  })
})