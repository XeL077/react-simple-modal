import React from 'react';
import { Portal } from '../portal/Portal';
import { Page } from './Page';

export default {
  title: 'Example/Portal',
  component: Portal,
};

const RenderPlayground = () => (
  <div>
    <Page />
    <div style={{border: `1px solid red`, padding: `10px`}}>
      Тут рендерится портал, но монтируется в другом месте
      <Portal renderPlace={document.getElementById('root')}>
        <div>Контент монтируется через портал в `Root`</div>
      </Portal>
    </div>
  </div>
);

export const Playground = RenderPlayground.bind({});
