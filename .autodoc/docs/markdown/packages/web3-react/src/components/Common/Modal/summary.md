[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/packages/web3-react/src/components/Common/Modal)

The `Modal` component in the Alephium-web3 project is a reusable and customizable modal dialog that can be used throughout the application for various purposes, such as displaying forms, notifications, or additional information. It provides features like transitions, animations, and focus trapping, making it a versatile and user-friendly UI element.

The component is built using `styled-components` for CSS-in-JS styling and `framer-motion` for handling animations and transitions. It consists of several styled components and animations, such as `ErrorMessage`, `PageContent`, `BackgroundOverlay`, and `ModalContainer`, which define the structure, styling, and animations for the modal and its content.

The `Modal` component accepts several props to control its behavior, such as `open`, `pages`, `pageId`, `positionInside`, `inline`, `onClose`, `onBack`, and `onInfo`. These props allow you to customize the modal's visibility, content, positioning, and event handlers for closing, going back, and showing more information.

Here's an example of how the `Modal` component can be used:

```jsx
import Modal, { routes, OrDivider } from './Modal';

const MyComponent = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const pages = [
    {
      id: routes.CONNECTORS,
      content: <div>Connectors Content</div>,
    },
    {
      id: routes.PROFILE,
      content: <div>Profile Content</div>,
    },
  ];

  return (
    <>
      <button onClick={() => setModalOpen(true)}>Open Modal</button>
      <Modal
        open={modalOpen}
        pages={pages}
        pageId={routes.CONNECTORS}
        onClose={handleModalClose}
      />
    </>
  );
};
```

In this example, a button is used to open the modal, and the `handleModalClose` function is passed as the `onClose` prop to close the modal. The `pages` array contains the content for each page within the modal, and the `pageId` prop is set to display the "Connectors" page initially.

The `Modal` component uses custom hooks like `useTransition`, `useFocusTrap`, and `usePrevious` to manage its state, focus management, and previous values. This makes the component more modular and easier to maintain, as the logic is separated from the presentation.

In summary, the `Modal` component in the Alephium-web3 project is a flexible and customizable UI element that can be used throughout the application for various purposes. Its combination of styled-components, framer-motion, and custom hooks makes it a powerful and user-friendly component that can enhance the overall user experience.
