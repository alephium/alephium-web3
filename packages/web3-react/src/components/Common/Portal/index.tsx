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
import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'

const Portal = (props: any) => {
  props = {
    selector: '__ALEPHIUMCONNECT__',
    ...props
  }

  const { selector, children } = props

  const ref = useRef<Element | null>(null)
  const [mounted, setMounted] = useState<boolean>(false)

  useEffect(() => {
    const selectorPrefixed = '#' + selector.replace(/^#/, '')
    ref.current = document.querySelector(selectorPrefixed)

    if (!ref.current) {
      const div = document.createElement('div')
      div.setAttribute('id', selector)
      document.body.appendChild(div)
      ref.current = div
    }

    setMounted(true)
  }, [selector])

  if (!ref.current) return null
  return mounted ? createPortal(children, ref.current) : null
}

export default Portal
