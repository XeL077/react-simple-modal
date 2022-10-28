import React, { FC, useCallback, useEffect, useRef } from 'react';
import 'simpleModal.css';
import { Portal } from '../portal/Portal';

function checkIsLastModal(scssClassName: string) {
  // нужно заменить на стек, который  регистрирует модальные окна и popup
  const frames = document.body.querySelectorAll(`.${scssClassName}`);
  return frames.length === 0 || frames.length === 1;
}

export type SimpleModalProps = {
  /**
   * *Флаг открытости*
   *
   * Позволяет управлять модалкой, используя внешний стейт. В этом случае
   * следует передавать в `isOpen` поле стейта, а также передавать коллбэк
   * `onClose={closeModal}`, который будет изменять внешний стейт.
   */
  isOpen: boolean;
  /**
   * *Callback, вызываемый при закрытии*
   */
  close: () => void;
  onBeforeClose?: () => boolean;
  /**
   * *Коллбэк перед закрытием*
   *
   * Вызывается в конце `this.hide()`.
   */
  onClose?: () => void;
  /**
   * *Коллбэк при открытии*
   *
   * Вызывается в конце `this.show()`.
   */
  onOpen?: () => void;

  /** один из параметров children или renderFC */
  children?: React.ReactNode;
  renderFC?: () => React.ReactElement;

  /**
   * *background*
   *
   * Добавляется стили фона модалки.
   * Так же можно менять прозрачность фона. Например 'rgba(255, 255, 128, .5)'.
   */
  background?: React.CSSProperties;
  /**
   * *Закрывать ли по клику вне модалки*
   */
  canCloseOnOutsideClick?: boolean;
  className?: string;
  /**
   * *Флаг для открытия рядом с нужным элементом*
   *
   * Если `true`, то перед открытием модалки нужно вызвать `this.openOnTarget(e)`.
   * Параметр `e` может быть как событием, так и обычным объектом, но должен иметь
   * поле `currentTarget`. На этот элемент и будет целиться модалка.
   *
   * Эффект следуюший. Модалка выезжает снизу. Если в момент открытия её высота
   * достаточно большая, чтобы доехать до таргета, то модалка доезжает до него
   * и останавливается.
   *
   * Если таргет достаточно высоко, модалка пристыковывается к низу страницы.
   *
   * Если таргет находится выше границы вьюпорта, и высота модалки не меньше `100vh`,
   * то модалка доедет до верхней границы вьюпорта и остановится.
   *
   * Если таргет находится ниже границы вьюпорта, то модалка откроется ниже
   * границы вьюпорта. Для того, чтобы её увидеть, нужно будет поскроллить.
   *
   * Пропс не совместим с `position`. При совместном использовании
   * выбрасывается исключение.
   */
  shouldOpenOnTarget?: boolean;
  /**
   * *Положение модалки*
   *
   * Пропс не совместим с `shouldOpenOnTarget`, при совместном использовании
   * выбрасывается исключение `COMPONENT_EXCEPTIONS.MODAL.POSITION`.
   * `undefined` (пропс не задан) — модалка всплывает по центру.
   *
   * `top | right | bottom | left` — модалка выезжает из-за соответствующей
   * границы экрана и пристыковывается к ней.
   *
   * `target` — модалка всплывает по центру, но пристыковывается к верхней
   * границе экрана. Пока что нигде не используется. Есть сомнения в валидности
   * этого значения.
   */
  position?: 'top' | 'right' | 'bottom' | 'left' | 'target';
  modalRef?: React.RefObject<HTMLDivElement>;
  /**
   * *Ref для открытия через shouldOpenOnTarget
   */
  refTarget?: React.RefObject<HTMLElement>;
  /**
   * *Флаг наличия белого покрывала*
   *
   * Добавляет класс `pt-modal-backdrop`.
   */
  hasBackdrop?: boolean;
  /**
   * *Флаг наличия перекрывающего контейнера*
   * При включении не будут отображаеться стили свойства hasBackdrop.
   *
   * Добавляет класс `pt-modal-exclude-overlay`.
   */
  excludeOverlay?: boolean;
};

/**
 * Отвечает за рендер любых модальных окон через ReactPortal.
 *
 * */

const SimpleModal: FC<SimpleModalProps> = (props) => {
  const {
    isOpen,
    close,
    onClose,
    onOpen,
    canCloseOnOutsideClick = true,
    className = '',
    hasBackdrop,
    excludeOverlay,
    background,
    shouldOpenOnTarget,
    position,
    modalRef,
    refTarget,
    renderFC,
    children,
  } = props;
  const ref = modalRef ?? useRef<HTMLDivElement>(null);
  const closeModal = useCallback(() => {
    if (typeof onClose === 'function') {
      onClose();
    }
    close();
  }, [onClose]);

  /**
   * Метод удаляет keydown listener и добавочный класс modal-open при соблюдении условий
   */
  const escListener = useCallback((e: KeyboardEvent) => {
    const key = e.key || e.keyCode;

    if (key === 'Escape' || key === 'Esc' || key === 27) {
      closeModal();
    }
  }, []);

  const outsideClickHandler = (event: React.MouseEvent) => {
    const target = event.target as HTMLDivElement;
    // если клик был за пределы модального окна мы закрываем его
    if (canCloseOnOutsideClick && target && ref.current?.contains(target) && target === ref.current) {
      closeModal();
    }
  };

  useEffect(() => {
    const blockedClassName = 'modal-is-open';

    if (isOpen && typeof onOpen === 'function') {
      onOpen();
    }

    // блокируем скролл body
    if (isOpen && !document.body.classList.contains(blockedClassName)) {
      document.body.classList.add(blockedClassName);
    }

    if (!isOpen && checkIsLastModal('modal-frame')) {
      document.body.classList.remove('modal-is-open');
    }
    document.addEventListener('keydown', escListener);

    return () => {
      if (checkIsLastModal('modal-frame')) {
        document.body.classList.remove('modal-is-open');
      }
      document.removeEventListener('keydown', escListener);
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const currentPos = shouldOpenOnTarget ? 'bottom' : position;

  const positionClass = currentPos ? `modal-pin-to-${currentPos}` : 'modal-default-mode';
  const backdropClass = hasBackdrop ? 'modal-backdrop' : '';

  const transparentClass = excludeOverlay ? 'modal-exclude-overlay' : '';

  const targetTop = refTarget?.current?.getBoundingClientRect().top;
  const style: React.CSSProperties = {
    ...background,
    marginTop: targetTop ? `${targetTop}px` : undefined,
  };
  return (
    <Portal>
      <div
        role="none"
        style={style}
        className={`${'modal-frame'} ${positionClass} ${className} ${backdropClass} ${transparentClass}`}
        ref={ref}
        onClick={outsideClickHandler}
        data-test="modal-overlay"
      >
        {renderFC ? renderFC() : children}
      </div>
    </Portal>
  );
};

export default SimpleModal;
