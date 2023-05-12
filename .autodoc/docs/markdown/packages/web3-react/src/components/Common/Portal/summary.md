[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/packages/web3-react/src/components/Common/Portal)

The `Portal` component in the `alephium-web3` project is a useful utility for rendering child components outside of their parent component's DOM hierarchy. This is particularly helpful when you need to render components like modals or tooltips at specific locations in the DOM.

The component utilizes the `useEffect` hook to check if the specified selector exists in the DOM. If it does, the component is mounted to the existing element. If it does not exist, a new element is created and mounted to the document body. The `useState` hook is used to keep track of the component's mounted state.

The `createPortal` function from the `react-dom` library is employed to render the child components into the mounted element. This function accepts two arguments: the child components to be rendered and the DOM element to render them into.

The `Portal` component takes two props: `selector` and `children`. The `selector` prop is used to specify the ID of the element to render the child components into. If no ID is specified, a default ID of `__ALEPHIUMCONNECT__` is used. The `children` prop is used to specify the child components to be rendered.

Here's an example of how the `Portal` component can be used:

```javascript
import Portal from './Portal'

const App = () => {
  return (
    <div>
      <h1>My App</h1>
      <Portal selector="#modal">
        <div>
          <h2>Modal</h2>
          <p>This is a modal.</p>
        </div>
      </Portal>
    </div>
  )
}
```

In this example, the `Portal` component is used to render a modal outside of the parent component's DOM hierarchy. The `selector` prop is set to `#modal`, which specifies that the child components should be rendered into an element with an ID of `modal`. If no such element exists, a new element with an ID of `modal` is created and mounted to the body of the document. The `children` prop specifies the child components to be rendered into the `modal` element.

In the larger project, the `Portal` component can be utilized to handle rendering of components that need to be displayed outside of their parent's DOM hierarchy, ensuring proper positioning and layering of elements like modals, tooltips, and dropdown menus.
