[View code on GitHub](https://github.com/alephium/alephium-web3/packages/web3/src/utils/number.fixture.ts)

This file contains two arrays of objects, `tests` and `tests1`, which are used for testing and formatting numerical values in the Alephium blockchain. 

The `tests` array contains objects with various numerical values in raw format, along with their corresponding decimal places and formatted versions in both Alphium and token formats. These objects are used to test the formatting functions in the larger project, ensuring that numerical values are displayed correctly in the user interface. 

The `tests1` array contains objects with raw numerical values in string format, along with their corresponding decimal places and converted values in BigInt format. These objects are used to convert user inputted numerical values into the appropriate format for use in the blockchain. 

Overall, this file serves as a reference for the expected formatting and conversion of numerical values in the Alephium blockchain. 

Example usage of these arrays in the larger project:

```
import { tests, tests1 } from 'alephium-web3/numericalValues';

// Use tests array to test formatting functions
tests.forEach((test) => {
  const formattedValue = formatValue(test.raw, test.decimal);
  console.log(`Raw value: ${test.raw}, Formatted value: ${formattedValue}`);
});

// Use tests1 array to convert user inputted values
const userInput = '1.23';
const decimals = 2;
const convertedValue = convertValue(userInput, decimals, tests1);
console.log(`User input: ${userInput}, Converted value: ${convertedValue}`);
```
## Questions: 
 1. What is the purpose of this code file?
- This code file contains two arrays of objects that are used for testing purposes.

2. What is the significance of the `raw` and `decimal` properties in the `tests` array?
- The `raw` property represents the raw value of a number, while the `decimal` property represents the number of decimal places to be displayed in various formats.

3. What is the purpose of the `tests1` array?
- The `tests1` array contains objects that represent different values and their corresponding decimal places, which are used for testing purposes.