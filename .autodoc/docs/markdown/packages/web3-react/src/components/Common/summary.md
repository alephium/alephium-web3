[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/packages/web3-react/src/components/Common)

The `Common` folder in the `alephium-web3` project contains a collection of reusable React components and utilities that can be used throughout the application to create a consistent and maintainable user interface. These components include `Alert`, `BrowserIcon`, `Button`, `CopyToClipboard`, `FitText`, `Modal`, `Portal`, `ThemedButton`, and `Tooltip`. Each component is designed to be flexible and customizable, allowing developers to easily integrate them into various parts of the project.

For example, the `Alert` component can be used to display error messages or notifications to the user:

```jsx
import Alert from 'alephium-web3/Alert'

function MyComponent() {
  const [error, setError] = React.useState(null)

  function handleButtonClick() {
    try {
      // some code that might throw an error
    } catch (error) {
      setError(error.message)
    }
  }

  return (
    <div>
      <button onClick={handleButtonClick}>Do something risky</button>
      {error && <Alert>{error}</Alert>}
    </div>
  )
}
```

The `BrowserIcon` component can be used to display browser-specific icons in the application:

```jsx
import BrowserIcon from 'alephium-web3';

function MyComponent() {
  return (
    <div>
      <h1>Welcome to my app</h1>
      <BrowserIcon browser="chrome" />
    </div>
  );
}
```

The `Modal` component can be used to create customizable modal dialogs for various purposes:

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

The `Tooltip` component can be used to display additional information when the user hovers over a specific element on the page:

```jsx
import Tooltip from 'alephium-web3/components/Tooltip'

function MyComponent() {
  return (
    <Tooltip message="Hello, world!" xOffset={10} yOffset={-10}>
      <button>Hover me</button>
    </Tooltip>
  )
}
```

In summary, the `Common` folder in the `alephium-web3` project provides a set of reusable and customizable components that can be used to create a consistent and maintainable user interface. These components are built using modern React patterns, styled-components, and TypeScript, ensuring a high-quality and easy-to-maintain codebase.
