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
import useFitText from '../../../hooks/useFitText'

const FitText = React.forwardRef(({ children }: { children: React.ReactNode }, ref: React.Ref<HTMLElement>) => {
  const [ready, setReady] = React.useState(false)
  const { fontSize, ref: textRef } = useFitText({
    logLevel: 'none',
    maxFontSize: 100,
    minFontSize: 70,
    onStart: () => setReady(true),
    onFinish: () => setReady(true)
  })
  return (
    <div
      ref={textRef}
      style={{
        visibility: ready ? 'visible' : 'hidden', // avoid flash of unstyled text
        fontSize: `${fontSize}%`,
        maxHeight: '100%',
        maxWidth: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
        //lineHeight: `${21 * (fontSize / 100)}px`,
        //background: fontSize !== '100%' ? 'red' : undefined, // debug
      }}
    >
      {children}
    </div>
  )
})
FitText.displayName = 'FitText'

export default FitText
