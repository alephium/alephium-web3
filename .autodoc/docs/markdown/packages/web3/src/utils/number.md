[View code on GitHub](https://github.com/alephium/alephium-web3/packages/web3/src/utils/number.ts)

This file contains a set of utility functions for formatting and converting numbers used in the Alephium project. The functions are exported and can be used in other parts of the project.

The `prettifyNumber` function takes a `Number256` value, which is a custom type used in the project to represent large integers, and formats it as a string with a specified number of decimal places. The function uses a configuration object to determine the minimum and maximum number of decimal places, the minimum number of significant digits to show in decimals, and the number of decimal places to show when the value is zero. The function first converts the `Number256` value to a `BigNumber` object from the `bignumber.js` library, then formats the number based on its value and the configuration object. The function returns the formatted string or `undefined` if the input value is not numeric.

The `prettifyAttoAlphAmount`, `prettifyTokenAmount`, and `prettifyExactAmount` functions are wrappers around `prettifyNumber` that provide pre-configured settings for formatting `ALPH`, `TOKEN`, and `Exact` amounts, respectively. These functions take a `Number256` value and the number of decimal places to use and return the formatted string or `undefined`.

The `convertAmountWithDecimals` and `convertAlphAmountWithDecimals` functions convert a string or number to a `Number256` value with a specified number of decimal places. The `convertAmountWithDecimals` function takes a value and the number of decimal places to use and returns a `BigInt` value. The `convertAlphAmountWithDecimals` function is a wrapper around `convertAmountWithDecimals` that uses 18 decimal places, which is the standard for `ALPH` amounts in the project.

The `number256ToBigint` function converts a `Number256` value to a `BigInt` value. If the input value is already a `BigInt`, the function returns it unchanged. Otherwise, the function converts the input value to a `BigInt` using the `BigInt` constructor.

Overall, this file provides a set of utility functions for formatting and converting numbers used in the Alephium project. These functions can be used in other parts of the project to ensure consistent formatting and conversion of numbers.
## Questions: 
 1. What is the purpose of this code file?
- This code file contains functions for prettifying and converting numbers with decimals, as well as a function for converting a Number256 type to a bigint.

2. What is the significance of the IPrettifyNumberConfig interface and prettifyNumberConfig object?
- The IPrettifyNumberConfig interface defines a configuration object for prettifying numbers with decimals, while the prettifyNumberConfig object contains specific configurations for different currencies (ALPH, TOKEN, and Exact).

3. What is the purpose of the convertAmountWithDecimals and convertAlphAmountWithDecimals functions?
- The convertAmountWithDecimals function converts an amount with a specified number of decimals to a bigint, while the convertAlphAmountWithDecimals function specifically converts an amount with 18 decimals (ALPH currency) to a bigint.