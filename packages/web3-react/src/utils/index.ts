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
import React from 'react'
import { detect } from 'detect-browser'

export const detectBrowser = () => {
  const browser = detect()
  return browser?.name ?? ''
}

const detectOS = () => {
  const browser = detect()
  return browser?.os ?? ''
}

const isIOS = () => {
  const os = detectOS()
  return os.toLowerCase().includes('ios')
}

const isAndroid = () => {
  const os = detectOS()
  return os.toLowerCase().includes('android')
}

export const isMobile = () => {
  return isAndroid() || isIOS()
}

type ReactChildArray = ReturnType<typeof React.Children.toArray>
export function flattenChildren(children: React.ReactNode): ReactChildArray {
  const childrenArray = React.Children.toArray(children)
  return childrenArray.reduce((flatChildren: ReactChildArray, child) => {
    if ((child as React.ReactElement<any>).type === React.Fragment) {
      return flatChildren.concat(flattenChildren((child as React.ReactElement<any>).props.children))
    }
    flatChildren.push(child)
    return flatChildren
  }, [])
}

export const truncatedAddress = (address: string) => {
  const start = address.slice(0, 6)
  const end = address.slice(-6)
  return `${start} ... ${end}`
}
