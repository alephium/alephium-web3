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

import 'cross-fetch/polyfill'
import { sleep } from '../utils'
import { RateLimit } from 'async-sema'

export function convertHttpResponse<T>(response: { data: T; error?: { detail: string } }): T {
  if (response.error) {
    throw new Error(`[API Error] - ${response.error.detail}`)
  } else {
    return response.data
  }
}

export async function retryFetch(...fetchParams: Parameters<typeof fetch>): ReturnType<typeof fetch> {
  const retry = async (retryCount: number): ReturnType<typeof fetch> => {
    const response = await fetch(...fetchParams)
    if (response.status === 429 && retryCount < RETRY_LIMIT_WHEN_429) {
      const nextCount = retryCount + 1
      await sleep(nextCount * 500)
      return await retry(nextCount)
    } else {
      return response
    }
  }
  return retry(0)
}

export function throttledFetch(ratePerSec: number): typeof fetch {
  const limit = RateLimit(ratePerSec)
  const customFetch = async (...fetchParams: Parameters<typeof fetch>): ReturnType<typeof fetch> => {
    await limit()
    return retryFetch(...fetchParams)
  }
  return customFetch
}

export const RETRY_LIMIT_WHEN_429 = 3
export const DEFAULT_RATE_LIMIT = 3
export const DEFAULT_THROTTLE_FETCH = throttledFetch(3)
