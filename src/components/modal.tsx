import { Cross2Icon, MinusIcon, SizeIcon } from '@radix-ui/react-icons';
import { invert, transparentize } from 'polished';
import React, {
  FC,
  ReactNode,
  ReactText,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { animated, interpolate, useSpring } from 'react-spring';
import { useDrag } from 'react-use-gesture';
import { Dialog, DialogBackdrop, useDialogState } from 'reakit/Dialog';
import { ModalIdentity } from 'shared/types/internal';
import { uiStore } from 'src/stores';
import styled, { css } from 'styled-components';
import Button from './button';
import Flex from './flex';
import Padder from './padder';
import Tooltip from './tooltip';
import { VisuallyHidden } from 'reakit/VisuallyHidden';

const trans = ([x, y]: [number, number]) => `translate3d(${x}px, ${y}px, 0)`;

interface ModalProps {
  title: ReactText | ReactNode;
  modalIdentity: ModalIdentity;
  onRequestClose: (modal: ModalIdentity) => void;
}

const Modal: FC<ModalProps> = ({
  title,
  onRequestClose,
  children,
  modalIdentity,
}) => {
  const dialog = useDialogState({ animated: 240 });
  const { activeModals, setUiStore } = uiStore();

  const modalRef = useRef<HTMLDivElement>();
  const ref = useRef<HTMLDivElement>(null);

  const isTucked =
    activeModals.find(m => m.id === modalIdentity.id)?.state === 'tucked';
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

  const getWindowDimensions = () => {
    const { innerWidth: width, innerHeight: height } = window;
    return {
      width,
      height,
    };
  };

  const [{ coord }, set] = useSpring(() => ({
    coord: [0, 0],
    config: { tension: 2000, clamp: true },
  }));

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
        left: -(getWindowDimensions().width - 600),
        right: getWindowDimensions().width - 600,
        top: -(
          getWindowDimensions().height -
          (getModalDimentions().height + 300 || 0)
        ),
        bottom:
          getWindowDimensions().height - (getModalDimentions().height || 0),
      },
    },
  );

  const [enterAnimation, setEnterAnimation] = useSpring(() => ({
    opacity: 0,
    transform: 'translateY(15px)',
    config: { tension: 300, friction: 30, velocity: 20 },
  }));

  useEffect(() => {
    const tucked = `translateY(${
      getWindowDimensions().height - getModalDimentions().y - 60
    }px)`;
    const expanded = `translateY(0px)`;
    const collapsed = `translateY(15px)`;

    setEnterAnimation({
      transform: isOpen ? expanded : isTucked ? tucked : collapsed,
      opacity: isOpen || isTucked ? 1 : 0,
    });
    dialog.setVisible(isOpen || isTucked);
  }, [isTucked, isOpen]);

  const onRequestHide = () => {
    setUiStore(d => {
      const ctxModal = activeModals.findIndex(m => m.id === modalIdentity.id);
      d.activeModals[ctxModal].state = isTucked ? 'expnanded' : 'tucked';
    });
  };

  return (
    <Blanket isTucked={isTucked} {...dialog}>
      <animated.div style={enterAnimation}>
        <StyledModal
          ref={modalRef}
          hideOnEsc={true}
          hideOnClickOutside={false}
          style={{
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transform: interpolate([coord] as any, trans as any),
          }}
          aria-label={`${title} Modal`}
          {...bindCanvas}
          {...dialog}
        >
          <Header ref={ref}>
            <Flex>
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
            </Flex>
            <h1>{title}</h1>
            <Padder x={30} />
          </Header>

          <Body>
            {isTucked ? <VisuallyHidden>{children}</VisuallyHidden> : children}
          </Body>
        </StyledModal>
      </animated.div>
    </Blanket>
  );
};

const lightStyles = css`
  background: ${p => p.theme.background.primary};
  box-shadow: 0 1px 2px 0px ${p => transparentize(0.95, p.theme.text.primary)},
    0 0 0 1px ${p => p.theme.border.primary} inset;
`;

const darkStyles = css`
  background: ${p => p.theme.background.primary};
  box-shadow: 0 0 0 1px ${p => invert(p.theme.text.primary)},
    0 0 0 1px ${p => transparentize(0, p.theme.border.primary)} inset;
`;

const Blanket = styled(DialogBackdrop)<{ isTucked: boolean }>`
  width: 100vw;
  height: 100vh;
  position: absolute;
  pointer-events: ${p => (p.isTucked ? 'none' : 'all')};
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${p =>
    p.isTucked ? 'transparent' : transparentize(0.5, 'black')};
  opacity: 0;
  transition: opacity 240ms cubic-bezier(0.19, 1, 0.22, 1);

  &[data-enter] {
    opacity: 1;
  }
`;

const StyledModal = styled(animated(Dialog))<{ ref: any }>`
  width: 600px;
  pointer-events: all;
  position: absolute;
  border-radius: 6px;
  position: relative;
  overflow: hidden;
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
  }
`;

const Body = styled.div`
  display: flex;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  flex-direction: column;
`;

export default Modal;
