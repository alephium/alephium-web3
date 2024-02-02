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

// from rainbowkit: https://github.com/rainbow-me/rainbowkit/blob/main/packages/rainbowkit/src/utils/isMobile.ts
function isAndroid(): boolean {
  return typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent)
}

function isSmallIOS(): boolean {
  return typeof navigator !== 'undefined' && /iPhone|iPod/.test(navigator.userAgent)
}

function isLargeIOS(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    (/iPad/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))
  )
}

function isIOS(): boolean {
  return isSmallIOS() || isLargeIOS()
}

export function isMobile(): boolean {
  return isAndroid() || isIOS()
}
