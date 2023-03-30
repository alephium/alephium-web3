import { useEffect } from 'react'
import { routes, useContext } from '../AlephiumConnect'
import Modal from '../Common/Modal'

import Connectors from '../Pages/Connectors'
import ConnectUsing from './ConnectUsing'
import Profile from '../Pages/Profile'
import { useAccount } from '../../hooks/useAccount'
import { Theme, Mode, CustomTheme } from '../../types'

const customThemeDefault: object = {}

const ConnectModal: React.FC<{
  mode?: Mode
  theme?: Theme
  customTheme?: CustomTheme
}> = ({ mode = 'auto', theme = 'auto', customTheme = customThemeDefault }) => {
  const context = useContext()
  const { isConnected } = useAccount()

  const closeable = true

  const showBackButton = context.route !== routes.CONNECTORS && context.route !== routes.PROFILE

  const onBack = () => {
    context.setRoute(routes.CONNECTORS)
  }

  const pages: any = {
    connectors: <Connectors />,
    connect: <ConnectUsing connectorId={context.connector} />,
    profile: <Profile />
  }

  function hide() {
    context.setOpen(false)
  }

  useEffect(() => {
    if (isConnected) {
      if (context.route !== routes.PROFILE) {
        hide() // Hide on connect
      }
    } else {
      hide() // Hide on connect
    }
  }, [isConnected])

  useEffect(() => context.setMode(mode), [mode])
  useEffect(() => context.setTheme(theme), [theme])
  useEffect(() => context.setCustomTheme(customTheme), [customTheme])

  /* When pulling data into WalletConnect, it prioritises the og:title tag over the title tag */
  useEffect(() => {
    const appName = 'alephium'
    if (!appName || !context.open) return

    const title = document.createElement('meta')
    title.setAttribute('property', 'og:title')
    title.setAttribute('content', appName)
    document.head.prepend(title)

    /*
    // TODO:  When pulling data into WalletConnect, figure out which icon gets used and replace with appIcon if available
    const appIcon = getAppIcon();
    const icon = document.createElement('link');
    if (appIcon) {
      icon.setAttribute('rel', 'icon');
      icon.setAttribute('href', appIcon);
      document.head.prepend(icon);
    }*/

    return () => {
      document.head.removeChild(title)
      //if (appIcon) document.head.removeChild(icon);
    }
  }, [context.open])

  return (
    <Modal
      open={context.open}
      pages={pages}
      pageId={context.route}
      onClose={closeable ? hide : undefined}
      onInfo={undefined}
      onBack={showBackButton ? onBack : undefined}
    />
  )
}

export default ConnectModal
