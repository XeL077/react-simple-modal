import React, { useState } from 'react';
import { SimpleModalProps } from './SimpleModal';

type UseModalProps = Omit<SimpleModalProps, 'isOpen' | 'close'> & {
  isOpen?: SimpleModalProps['isOpen'];
  close?: SimpleModalProps['close'];
};


const useModal = <T extends UseModalProps>(ModalComponent: React.JSXElementConstructor<T>, isOpened = false) => {
  const [isOpen, setIsShowing] = useState(isOpened);

  function toggle() {
    setIsShowing(!isOpen);
  }

  function close() {
    setIsShowing(false);
  }

  function open() {
    setIsShowing(true);
  }

  const ViewModal: React.FC<T> = React.useCallback(
    (viewModalProps) => {
      const closeModal = () => {
        if (viewModalProps.onBeforeClose) {
          const dontClose = viewModalProps.onBeforeClose();

          if (dontClose) {
            return;
          }
        }

        close();
      };

      if (ModalComponent) {
        return (
          <ModalComponent
            {...viewModalProps}
            close={viewModalProps.close ?? closeModal}
            isOpen={viewModalProps.isOpen ?? isOpen}
          >
            <>{viewModalProps.children}</>
          </ModalComponent>
        );
      }
      return null;
    },
    [isOpen]
  );

  return {
    isOpen,
    toggle,
    close,
    open,
    setIsShowing,
    ViewModal,
  };
};

export default useModal;
