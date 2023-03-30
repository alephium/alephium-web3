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

import { ThemeContainer, Container } from './styles'

import useMeasure from 'react-use-measure'

type ThemedButtonProps = {
  children?: React.ReactNode
  variant?: 'primary' | 'secondary' | 'tertiary'
  autoSize?: boolean
  duration?: number
  style?: React.CSSProperties
  onClick?: () => void
}

const ThemedButton: React.FC<ThemedButtonProps> = ({
  children,
  variant = 'primary',
  autoSize = true,
  duration = 0.3,
  style
}) => {
  const [contentRef, bounds] = useMeasure()
  return (
    <Container
      className={variant}
      initial={false}
      animate={
        autoSize
          ? {
              width: bounds.width > 10 ? bounds.width : 'auto'
            }
          : undefined
      }
      transition={{
        duration: duration,
        ease: [0.25, 1, 0.5, 1],
        delay: 0.01
      }}
      style={style}
    >
      <div
        ref={contentRef}
        style={{
          whiteSpace: 'nowrap',
          width: 'fit-content',
          position: 'relative',
          padding: '0 12px'
        }}
      >
        {children}
      </div>
    </Container>
  )
}
export default ThemedButton
export { ThemeContainer }
