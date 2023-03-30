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

import { BrowserIconProps } from './types'
import { BrowserIconContainer } from './styles'

import { detectBrowser } from '../../../utils'
import browsers from '../../../assets/browsers'

const BrowserIcon = React.forwardRef(({ browser }: BrowserIconProps, ref: React.Ref<HTMLElement>) => {
  const currentBrowser = browser ?? detectBrowser()

  let icon
  switch (currentBrowser) {
    case 'chrome':
      icon = browsers.Chrome
      break
    case 'firefox':
      icon = browsers.FireFox
      break
    case 'edge':
      icon = browsers.Edge
      break
    case 'brave':
      //   icon = browsers.Brave;
      break
  }
  if (!icon) return <></>
  return <BrowserIconContainer>{icon}</BrowserIconContainer>
})
BrowserIcon.displayName = 'BrowserIcon'

export default BrowserIcon
