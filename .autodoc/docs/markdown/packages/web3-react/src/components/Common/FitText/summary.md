[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/packages/web3-react/src/components/Common/FitText)

The `FitText` component, located in the `alephium-web3/components/Common/FitText` folder, is a React component that automatically adjusts the font size of its child elements to fit within the available space. This is particularly useful for cases where the size of the text may vary depending on the user's device or screen size.

The component utilizes the `useFitText` hook from the `../../../hooks/useFitText` module to calculate the appropriate font size. The hook accepts several options, such as `maxFontSize` and `minFontSize`, which define the maximum and minimum font sizes that the component can use. Additionally, the `onStart` and `onFinish` options are callbacks that are called when the font size calculation starts and finishes, respectively.

The `FitText` component renders a `div` element that wraps its child elements. The `ref` of this `div` element is set to the `textRef` variable returned by the `useFitText` hook, allowing the hook to measure the size of the text and calculate the appropriate font size. The `visibility` style of the `div` element is set to `hidden` until the font size calculation is complete, to avoid a flash of unstyled text.

The calculated font size is applied to the `fontSize` style of the `div` element. The `maxHeight` and `maxWidth` styles are set to `100%` to ensure that the text fits within the available space. The `display`, `justifyContent`, and `alignItems` styles are set to `flex`, `center`, and `center`, respectively, to center the text horizontally and vertically within the `div` element.

The `FitText` component can be imported and used in other parts of the project like any other React component. For example:

```jsx
import FitText from 'alephium-web3/components/FitText'

function MyComponent() {
  return (
    <div>
      <FitText>
        <h1>Hello, world!</h1>
      </FitText>
    </div>
  )
}
```

In summary, the `FitText` component is a useful utility for ensuring that text content fits within the available space, regardless of the user's device or screen size. By leveraging the `useFitText` hook, it provides a flexible and efficient solution for automatically adjusting font sizes in the Alephium Web3 project.
