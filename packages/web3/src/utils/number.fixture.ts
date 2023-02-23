/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/
export const tests = [
  {
    raw: 123456n,
    decimal: 5,
    exact: '1.23456',
    alphFormat: '1.23',
    tokenFormat: '1.2346'
  },
  {
    raw: 12345612n,
    decimal: 2,
    exact: '123,456.12',
    alphFormat: '123,456.12',
    tokenFormat: '123,456.12'
  },
  {
    raw: 123456123456n,
    decimal: 6,
    exact: '123,456.123456',
    alphFormat: '123,456.12',
    tokenFormat: '123,456.1235'
  },
  {
    raw: 12n,
    decimal: 2,
    exact: '0.12',
    alphFormat: '0.12',
    tokenFormat: '0.12'
  },
  {
    raw: 123456n,
    decimal: 6,
    exact: '0.123456',
    alphFormat: '0.12',
    tokenFormat: '0.1235'
  },
  {
    raw: 123456n,
    decimal: 7,
    exact: '0.0123456',
    alphFormat: '0.012',
    tokenFormat: '0.0123'
  },
  {
    raw: 123456n,
    decimal: 8,
    exact: '0.00123456',
    alphFormat: '0.0012',
    tokenFormat: '0.0012'
  },
  {
    raw: 123456n,
    decimal: 9,
    exact: '0.000123456',
    alphFormat: '0.00012',
    tokenFormat: '0.00012'
  },
  {
    raw: 123456n,
    decimal: 11,
    exact: '0.00000123456',
    alphFormat: '0.0000012',
    tokenFormat: '0.0000012'
  },
  {
    raw: -123456n,
    decimal: 11,
    exact: '-0.00000123456',
    alphFormat: '-0.0000012',
    tokenFormat: '-0.0000012'
  },
  {
    raw: 8923088n,
    decimal: 10,
    exact: '0.0008923088',
    alphFormat: '0.00089',
    tokenFormat: '0.00089'
  },
  {
    raw: 885n,
    decimal: 6,
    exact: '0.000885',
    alphFormat: '0.00089',
    tokenFormat: '0.00089'
  },
  {
    raw: 100000000000n,
    decimal: 18,
    exact: '0.0000001',
    alphFormat: '0.0000001',
    tokenFormat: '0.0000001'
  },
  {
    raw: 1504000000000000000n,
    decimal: 18,
    exact: '1.504',
    alphFormat: '1.50',
    tokenFormat: '1.504'
  },
  {
    raw: 1505000000000000000n,
    decimal: 18,
    exact: '1.505',
    alphFormat: '1.51',
    tokenFormat: '1.505'
  },
  {
    raw: 1500050000000000000n,
    decimal: 18,
    exact: '1.50005',
    alphFormat: '1.50',
    tokenFormat: '1.5001'
  },
  {
    raw: 100n,
    decimal: 0,
    exact: '100',
    alphFormat: '100.00',
    tokenFormat: '100.0'
  },
  {
    raw: 123456789n,
    decimal: 0,
    exact: '123,456,789',
    alphFormat: '123,456,789.00',
    tokenFormat: '123,456,789.0'
  },
  {
    raw: -123456789n,
    decimal: 0,
    exact: '-123,456,789',
    alphFormat: '-123,456,789.00',
    tokenFormat: '-123,456,789.0'
  },
  {
    raw: 0n,
    decimal: 0,
    exact: '0',
    alphFormat: '0.00',
    tokenFormat: '0.0'
  }
]

export const tests1 = [
  {
    raw: '0',
    decimals: 18,
    amount: 0n
  },
  {
    raw: '1.23',
    decimals: 2,
    amount: 123n
  },
  {
    raw: '1',
    decimals: 5,
    amount: 100000n
  },
  {
    raw: '1',
    decimals: 18,
    amount: 1000000000000000000n
  },
  {
    raw: '1.23456789',
    decimals: 18,
    amount: 1234567890000000000n
  }
]
