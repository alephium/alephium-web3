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
import React, { useEffect, useState } from 'react'
import { PageContent } from '../Common/Modal/styles'
import { useConnectSettingContext } from '../../contexts/alephiumConnect'
import { Container } from './ConnectWithInjector/styles'
import { useConnect } from '../../hooks/useConnect'

const ConnectWithDesktopWallet: React.FC = () => {
  const context = useConnectSettingContext()
  const [error, setError] = useState<string>()
  const { connect } = useConnect({
    addressGroup: context.addressGroup,
    networkId: context.network
  })

  useEffect(() => {
    connect().catch((err) => setError(`${err}`))
  }, [connect])

  return (
    <PageContent>
      <Container>{error !== undefined ? error : 'Opening desktop wallet...'}</Container>
    </PageContent>
  )
}

export default ConnectWithDesktopWallet
