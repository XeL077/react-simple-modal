import React from 'react';
import * as ReactDOM from 'react-dom';

interface PortalProps {
  /**
   * Элемент отрисовки
   * */
  children: React.ReactNode;

  /**
   * Место для вставки
   * */
  renderPlace?: HTMLElement | null;
}

export class Portal extends React.Component<PortalProps> {
  render() {
    const { children, renderPlace } = this.props;
    return ReactDOM.createPortal(children, renderPlace ? renderPlace : document.body);
  }
}
