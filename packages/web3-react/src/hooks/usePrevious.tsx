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
import { useRef, useEffect } from 'react'

export default function usePrevious(value: any, initial?: any) {
  const ref = useRef({ target: value, previous: initial })

  if (ref.current.target !== value) {
    // The value changed.
    ref.current.previous = ref.current.target
    ref.current.target = value
  }

  return ref.current.previous
}
