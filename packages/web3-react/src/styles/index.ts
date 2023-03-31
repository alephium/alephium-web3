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
import styled from './styled'
import { motion } from 'framer-motion'
import { css } from 'styled-components'

import predefinedThemes from './themes'

/**
 * Theme variables for the modal
 */
const themeGlobals = {
  default: {
    '--ck-font-family': `-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica,
    'Apple Color Emoji', Arial, sans-serif, 'Segoe UI Emoji',
    'Segoe UI Symbol'`,
    '--ck-border-radius': '20px',
    '--ck-secondary-button-border-radius': '16px'
  },
  graphics: {
    light: {
      '--ck-graphic-wave-stop-01': '#E8F17D',
      '--ck-graphic-wave-stop-02': '#A8ECDE',
      '--ck-graphic-wave-stop-03': '#7AA1F2',
      '--ck-graphic-wave-stop-04': '#DEA1E8',
      '--ck-graphic-wave-stop-05': '#F46D98',

      '--ck-graphic-scaniconwithlogos-01': '#4E4E4E',
      '--ck-graphic-scaniconwithlogos-02': '#272727',
      '--ck-graphic-scaniconwithlogos-03': '#F8D74A',
      '--ck-graphic-scaniconwithlogos-04': '#F6F7F9',

      '--ck-chain-ethereum-01': '#25292E',
      '--ck-chain-ethereum-02': '#fff',
      '--ck-chain-ethereum-03': '#DFE0E0'
    },
    dark: {
      '--ck-graphic-wave-stop-01': '#E8F17D',
      '--ck-graphic-wave-stop-02': '#A8ECDE',
      '--ck-graphic-wave-stop-03': '#7AA1F2',
      '--ck-graphic-wave-stop-04': '#DEA1E8',
      '--ck-graphic-wave-stop-05': '#F46D98',

      '--ck-graphic-scaniconwithlogos-01': '#AFAFAF',
      '--ck-graphic-scaniconwithlogos-02': '#696969',
      '--ck-graphic-scaniconwithlogos-03': '#F8D74A',
      '--ck-graphic-scaniconwithlogos-04': '#3D3D3D'

      //'--ck-chain-ethereum-01': '#fff',
      //'--ck-chain-ethereum-02': '#000',
      //'--ck-chain-ethereum-03': '#000',
    }
  },
  ens: {
    light: {
      '--ck-ens-01-start': '#FF3B30',
      '--ck-ens-01-stop': '#FF9500',
      '--ck-ens-02-start': '#FF9500',
      '--ck-ens-02-stop': '#FFCC00',
      '--ck-ens-03-start': '#FFCC00',
      '--ck-ens-03-stop': '#34C759',
      '--ck-ens-04-start': '#5856D6',
      '--ck-ens-04-stop': '#AF52DE',
      '--ck-ens-05-start': '#5AC8FA',
      '--ck-ens-05-stop': '#007AFF',
      '--ck-ens-06-start': '#007AFF',
      '--ck-ens-06-stop': '#5856D6',
      '--ck-ens-07-start': '#5856D6',
      '--ck-ens-07-stop': '#AF52DE',
      '--ck-ens-08-start': '#AF52DE',
      '--ck-ens-08-stop': '#FF2D55'
    },
    dark: {
      '--ck-ens-01-start': '#FF453A',
      '--ck-ens-01-stop': '#FF9F0A',
      '--ck-ens-02-start': '#FF9F0A',
      '--ck-ens-02-stop': '#FFD60A',
      '--ck-ens-03-start': '#FFD60A',
      '--ck-ens-03-stop': '#32D74B',
      '--ck-ens-04-start': '#32D74B',
      '--ck-ens-04-stop': '#64D2FF',
      '--ck-ens-05-start': '#64D2FF',
      '--ck-ens-05-stop': '#0A84FF',
      '--ck-ens-06-start': '#0A84FF',
      '--ck-ens-06-stop': '#5E5CE6',
      '--ck-ens-07-start': '#5E5CE6',
      '--ck-ens-07-stop': '#BF5AF2',
      '--ck-ens-08-start': '#BF5AF2',
      '--ck-ens-08-stop': '#FF2D55'
    }
  },
  brand: {
    '--ck-family-brand': '#1A88F8',
    '--ck-brand-walletConnect': '#3B99FC',
    '--ck-brand-coinbaseWallet': '#0052FF',
    '--ck-brand-metamask': '#f6851b',
    '--ck-brand-metamask-01': '#F6851B',
    '--ck-brand-metamask-02': '#E2761B',
    '--ck-brand-metamask-03': '#CD6116',
    '--ck-brand-metamask-04': '#161616',
    '--ck-brand-metamask-05': '#763D16',
    '--ck-brand-metamask-06': '#D7C1B3',
    '--ck-brand-metamask-07': '#C0AD9E',
    '--ck-brand-metamask-08': '#E4761B',
    '--ck-brand-metamask-09': '#233447',
    '--ck-brand-metamask-10': '#E4751F',
    '--ck-brand-metamask-11': '#FEF5E7',
    '--ck-brand-metamask-12': '#E3C8AB',
    '--ck-brand-trust-01': '#3375BB',
    '--ck-brand-trust-02': '#ffffff',
    '--ck-brand-trust-01b': '#ffffff', // dark Theme
    '--ck-brand-trust-02b': '#3375BB', // dark Theme
    '--ck-brand-argent': '#f36a3d',
    '--ck-brand-imtoken-01': '#11C4D1',
    '--ck-brand-imtoken-02': '#0062AD'
  }
}

const hexToP3 = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (result == null) return hex
  const values = {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  }
  return `color(display-p3 ${values.r / 255} ${values.g / 255} ${values.b / 255})`
}

//  TODO: Don't use :any type
const createCssVars = (scheme: any, important?: boolean) => {
  return css`
    ${Object.keys(scheme).map((key) => {
      const value = scheme[key]
      return value && `${key}:${value};`
    })}
  `
}

const themeColors = {
  light: predefinedThemes.base.light,
  dark: predefinedThemes.base.dark,
  web95: predefinedThemes.web95,
  retro: predefinedThemes.retro,
  soft: predefinedThemes.soft,
  midnight: predefinedThemes.midnight,
  minimal: predefinedThemes.minimal,
  rounded: predefinedThemes.rounded,
  nouns: predefinedThemes.nouns
}

const createCssColors = (scheme: any, override?: boolean) => {
  const important = override ? ' !important' : ''
  return css`
    ${Object.keys(scheme).map((key) => {
      const value = scheme[key]
      return value && `${key}:${value}${important};`
    })}
    @supports (color: color(display-p3 1 1 1)) {
      ${Object.keys(scheme).map((key) => {
        const value = scheme[key]
        return `${key}:${hexToP3(value)}${important};`
      })}
    }
  `
}

export const themes = {
  default: createCssVars(themeGlobals.default),
  light: createCssColors(themeColors.light),
  dark: createCssColors(themeColors.dark),
  web95: createCssColors(themeColors.web95),
  retro: createCssColors(themeColors.retro),
  soft: createCssColors(themeColors.soft),
  midnight: createCssColors(themeColors.midnight),
  minimal: createCssColors(themeColors.minimal),
  rounded: createCssColors(themeColors.rounded),
  nouns: createCssColors(themeColors.nouns)
}

const globals = {
  brand: createCssVars(themeGlobals.brand),
  ensLight: createCssVars(themeGlobals.ens.light),
  ensDark: createCssVars(themeGlobals.ens.dark),
  graphicsLight: createCssVars(themeGlobals.graphics.light),
  graphicsDark: createCssVars(themeGlobals.graphics.dark)
}

const globalsLight = css`
  ${globals.brand}
  ${globals.ensLight}
  ${globals.graphicsLight}
`
const globalsDark = css`
  ${globals.brand}
  ${globals.ensDark}
  ${globals.graphicsDark}
`

let mode = 'auto'
export const ResetContainer = styled(motion.div)<{
  $useTheme?: string
  $useMode?: string
  $customTheme?: any
}>`
  ${themes.default}

  ${(props) => {
    switch (props.$useTheme) {
      case 'web95':
        mode = 'light'
        return themes.web95
      case 'retro':
        mode = 'light'
        return themes.retro
      case 'soft':
        mode = 'light'
        return themes.soft
      case 'midnight':
        mode = 'dark'
        return themes.midnight
      case 'minimal':
        mode = 'light'
        return themes.minimal
      case 'rounded':
        mode = 'light'
        return themes.rounded
      case 'nouns':
        mode = 'light'
        return themes.nouns
      default:
        if (props.$useMode === 'light') {
          mode = 'light'
          return themes.light
        } else if (props.$useMode === 'dark') {
          mode = 'dark'
          return themes.dark
        } else {
          return css`
            @media (prefers-color-scheme: light) {
              ${themes.light}
            }
            @media (prefers-color-scheme: dark) {
              ${themes.dark}
            }
          `
        }
    }
  }}

  ${(props) => {
    switch (mode) {
      case 'light':
        return globalsLight
      case 'dark':
        return globalsDark
      default:
        return css`
          ${globalsLight}
          @media (prefers-color-scheme: dark) {
            ${globalsDark}
          }
        `
    }
  }}


  ${(props) => {
    //console.log(props.$customTheme);
    if (props.$customTheme) {
      return createCssColors(props.$customTheme, true)
    }
  }}

  all: initial;
  text-align: left;
  text-direction: ltr;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-text-stroke: 0.001px transparent;
  text-size-adjust: none;
  font-size: 16px;

  button {
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    -webkit-text-stroke: 0.001px transparent;
  }

  &,
  * {
    font-family: var(--ck-font-family);
    box-sizing: border-box;
    outline: none;
    border: none;
  }
  /*
  @media (prefers-reduced-motion) {
    * {
      animation-duration: 60ms !important;
      transition-duration: 60ms !important;
    }
  }
  */
  img,
  svg {
    max-width: 100%;
  }
  strong {
    font-weight: 600;
  }
  a:focus-visible,
  button:focus-visible {
    outline: 2px solid var(--ck-focus-color);
  }
`
