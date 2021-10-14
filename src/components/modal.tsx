import { Cross2Icon, MinusIcon, SizeIcon } from '@radix-ui/react-icons';
import { easeExpInOut } from 'd3-ease';
import { invert, transparentize } from 'polished';
import React, {
  FC,
  MutableRefObject,
  ReactNode,
  ReactText,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { animated, to, useSpring } from 'react-spring';
import { useDrag } from 'react-use-gesture';
import {
  Dialog,
  DialogBackdrop,
  DialogStateReturn,
  useDialogState,
} from 'reakit/Dialog';
import { VisuallyHidden } from 'reakit/VisuallyHidden';
import { uiStore } from 'src/stores';
import styled, { css } from 'styled-components';
import { ModalIdentity } from 'typings';
import Button from './button';
import Flex from './flex';
import Padder from './padder';
import Tooltip from './tooltip';
const trans = ([x, y]: [number, number]) => `translate3d(${x}px, ${y}px, 0)`;

interface ModalProps {
  title: ReactText | ReactNode;
  modalIdentity: ModalIdentity<unknown>;
  onRequestClose: (modal: ModalIdentity<unknown>) => void;
  collapsable?: boolean;
}

const Modal: FC<ModalProps> = ({
  title,
  onRequestClose,
  children,
  modalIdentity,
  collapsable = false,
}) => {
  const dialog = useDialogState({ animated: 240 });
  const { activeModals, setUiStore } = uiStore();
  const [isVisualyHidden, setIsVisuallyHiden] = useState(false);

  const isTucked =
    activeModals.find(m => m.id === modalIdentity.id)?.state === 'tucked';

  const onRequestHide = () => {
    const ctxModal = activeModals.findIndex(m => m.id === modalIdentity.id);
    setUiStore(d => {
      d.activeModals[ctxModal].state = isTucked ? 'expnanded' : 'tucked';
    });
  };

  useEffect(() => {
    setTimeout(
      () => {
        setIsVisuallyHiden(isTucked);
      },
      isTucked ? 420 : 0,
    );
  }, [isTucked]);

  return (
    <Blanket isTucked={isTucked} {...dialog}>
      <ModalBody
        isTucked={isTucked}
        activeModals={activeModals}
        modalIdentity={modalIdentity}
        title={title}
        dialog={dialog}
        collapsable={collapsable}
        onRequestClose={onRequestClose}
        onRequestHide={onRequestHide}
      >
        {isVisualyHidden ? (
          <VisuallyHidden>{children}</VisuallyHidden>
        ) : (
          children
        )}
      </ModalBody>
    </Blanket>
  );
};

const ModalBody: FC<{
  activeModals: ModalIdentity<unknown>[];
  modalIdentity: ModalIdentity<unknown>;
  isTucked: boolean;
  title: ReactNode | undefined;
  dialog: DialogStateReturn;
  collapsable: boolean;
  onRequestClose: (modal: ModalIdentity<unknown>) => void;
  onRequestHide: () => void;
}> = ({
  activeModals,
  isTucked,
  modalIdentity,
  title,
  dialog,
  collapsable,
  children,
  onRequestClose,
  onRequestHide,
}) => {
  const modalRef = useRef() as MutableRefObject<HTMLDivElement>;
  const ref = useRef<HTMLDivElement>(null);

  const getWindowDimensions = () => {
    const { innerWidth: width, innerHeight: height } = window;
    return {
      width,
      height,
    };
  };

  const isOpen =
    activeModals.find(m => m.id === modalIdentity.id)?.state === 'expnanded';

  const getModalDimentions = () => {
    if (modalRef && modalRef.current) {
      return modalRef.current?.getBoundingClientRect().toJSON();
    } else {
      return {};
    }
  };

  const [modalDimentions, setModalDimentions] = useState<
    DOMRect | Record<string, unknown>
  >({});

  useLayoutEffect(() => {
    if (modalRef && modalRef.current) {
      setModalDimentions(getModalDimentions());
    }
  }, [modalRef.current]);

  const [enterAnimation, setEnterAnimation] = useSpring(() => ({
    opacity: 0,
    transform: 'translate(0px, 50px) ',
    transformOrigin: '300px 600px',
    width: 600,
    scale: 1,
    config: {
      duration: 420,
      easing: t => easeExpInOut(t),
    },
  }));

  useEffect(() => {
    const tucked = `translate(0px, ${getWindowDimensions().height / 6}px) `;

    const expanded = `translate(0px, 0px) `;
    const collapsed = `translate(0px, 15px) `;

    setEnterAnimation({
      transform: isOpen ? expanded : isTucked ? tucked : collapsed,
      opacity: isOpen ? 1 : 0,
      scale: isOpen ? 1 : 0.2,
    });
    dialog.setVisible(isOpen || isTucked);
  }, [isTucked, isOpen]);

  const [{ coord }, set] = useSpring(() => ({
    coord: [0, 0],
    config: { tension: 2000, clamp: true },
  }));

  const getModalSpaceDelta = (dimention: 'height' | 'width') =>
    getWindowDimensions()[dimention] - getModalDimentions()[dimention];

  const bindCanvas = useDrag(
    ({ offset, down }) => {
      if (down) {
        set({ coord: offset });
        setModalDimentions({ ...modalDimentions, x: offset[0], y: offset[1] });
      }
    },

    {
      enabled: !isTucked,
      domTarget: ref,
      bounds: {
        left: -getModalSpaceDelta('width'),
        right: getModalSpaceDelta('width'),
        top: -getModalSpaceDelta('height') / 2,
        bottom: getModalSpaceDelta('height') * 2 + 42,
      },
    },
  );

  return (
    <animated.div style={enterAnimation}>
      <StyledModal
        isTucked={isTucked}
        ref={modalRef}
        hideOnEsc={true}
        hideOnClickOutside={false}
        style={{
          opacity: enterAnimation.opacity,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          transform: to([coord] as any, trans as any),
        }}
        aria-label={`${title} Modal`}
        {...bindCanvas}
        {...dialog}
      >
        <Header ref={ref}>
          <Flex style={{ minWidth: '60px' }}>
            {!isTucked && (
              <>
                <Tooltip tabIndex={-1} label="Close modal">
                  <Button
                    style={{ width: '30px', padding: 0 }}
                    tabIndex={-1}
                    hierarchy="ternary"
                    onClick={() => onRequestClose(modalIdentity)}
                  >
                    <Cross2Icon />
                  </Button>
                </Tooltip>

                {collapsable && (
                  <Tooltip
                    tabIndex={-1}
                    label={isTucked ? 'Expand modal' : 'Hide modal'}
                  >
                    <Button
                      style={{ width: '30px', padding: 0 }}
                      tabIndex={-1}
                      hierarchy="ternary"
                      onClick={onRequestHide}
                    >
                      {isTucked ? <SizeIcon /> : <MinusIcon />}
                    </Button>
                  </Tooltip>
                )}
              </>
            )}
          </Flex>

          <h1>{title}</h1>
          <Padder x={78} />
        </Header>
        <Body>{children}</Body>
      </StyledModal>
    </animated.div>
  );
};

const lightStyles = css`
  background: ${p => p.theme.background.primary};
  box-shadow: 0 40px 64px 0 rgba(65, 78, 101, 0.1),
    0 24px 32px 0 rgba(65, 78, 101, 0.1), 0 16px 16px 0 rgba(65, 78, 101, 0.1),
    0 8px 8px 0 rgba(65, 78, 101, 0.1), 0 4px 4px 0 rgba(65, 78, 101, 0.1),
    0 2px 2px 0 rgba(65, 78, 101, 0.1);
`;

const darkStyles = css`
  background: ${p => p.theme.background.primary};
  box-shadow: 0 0 0 1px ${p => invert(p.theme.text.primary)},
    0 0 0 1px ${p => transparentize(0, p.theme.border.primary)} inset,
    0 40px 64px 0 rgba(0, 0, 0, 0.2), 0 24px 32px 0 rgba(0, 0, 0, 0.2),
    0 16px 16px 0 rgba(0, 0, 0, 0.2), 0 8px 8px 0 rgba(0, 0, 0, 0.2),
    0 4px 4px 0 rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.2);
`;

const Blanket = styled(DialogBackdrop)<{ isTucked: boolean }>`
  width: 100vw;
  height: 100vh;
  position: absolute;
  pointer-events: ${p => (p.isTucked ? 'none' : 'all')};
  user-select: ${p => (p.isTucked ? 'none' : 'all')};
  top: 0;
  z-index: 991;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${p =>
    p.isTucked ? 'transparent' : transparentize(0.5, 'black')};
  opacity: 0;
  transition: background 240ms cubic-bezier(0.19, 1, 0.22, 1);

  &[data-enter] {
    opacity: 1;
  }
`;

const StyledModal = styled(animated(Dialog))<{ isTucked: boolean }>`
  /* width: ${p => (p.isTucked ? 300 : 600)}px; */
  pointer-events: all;
  position: absolute;
  border-radius: 6px;
  position: relative;
  pointer-events: ${p => (p.isTucked ? 'none' : 'all')};
  user-select: ${p => (p.isTucked ? 'none' : 'all')};
  /* overflow: hidden; */
  opacity: 1;
  flex-direction: column;
  max-height: calc(100vh - 96px);
  display: flex;
  ${p => (p.theme.id === 'dark' ? darkStyles : lightStyles)};
`;

const Header = styled.div`
  height: 60px;
  min-height: 60px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: inset 0 -1px 0 0 ${p => p.theme.border.primary};
  user-select: none;

  :hover {
    cursor: grab;
  }
  :active {
    cursor: grabbing;
  }
  h1 {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    padding: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const Body = styled.div`
  display: flex;
  position: relative;
  /* overflow-x: hidden; */
  /* overflow-y: auto; */
  flex-direction: column;
`;

export default Modal;
