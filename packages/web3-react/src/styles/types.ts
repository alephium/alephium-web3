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
type RGB = `rgb(${number}, ${number}, ${number})`
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`
type HEX = `#${string}`
type Color = RGB | RGBA | HEX

type BorderRadius = number | string
type Font = {
  family?: string
}

interface Button {
  font?: Font
  color?: Color
  background?: Color
  border?: Color
  borderRadius?: BorderRadius
  hover?: this
}

interface Text {
  color?: Color
  font?: Font
  hover?: this
}

export type Theme = {
  font?: Font
  primary?: {
    color?: Color
    colorSelected?: Color
  }
  error?: {
    color?: Color
  }
  text?: {
    primary?: Text
    secondary?: Text
    error?: Color
    valid?: Color
  }
  navigation?: {
    color?: Color
  }
  buttons?: {
    primary?: Button
    secondary?: Button
  }
  modal?: {
    divider: Color
    background?: Color
    boxShadow?: string
    borderRadius?: BorderRadius
  }
  overlay?: {
    background?: Color
    backdropFilter?: string
  }
  tooltips?: {
    color?: Color
    background?: Color
    hover?: {
      color?: Color
      background?: Color
    }
  }
  qrCode?: {
    background?: Color
    accentColor?: Color
  }
}

export type ThemeMode = {
  preferred: 'light' | 'dark'
  light: Theme
  dark: Theme
}
export type CustomTheme = {
  connectKit: {
    options?: {
      iconStyle?: 'light' | 'regular' | 'heavy'
    }
    theme?: Theme | ThemeMode
  }
}
