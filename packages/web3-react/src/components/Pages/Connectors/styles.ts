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
import styled from './../../../styles/styled'
import { motion } from 'framer-motion'

export const ConnectorsContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 0 16px;
`

export const ConnectorButton = styled(motion.button)`
  cursor: pointer;
  user-select: none;
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 20px;
  width: 100%;
  height: 64px;
  font-size: 17px;
  font-weight: var(--ck-primary-button-font-weight, 500);
  line-height: 20px;
  text-align: var(--ck-body-button-text-align, left);
  transition: 180ms ease;
  transition-property: background, color, box-shadow, transform;
  will-change: transform, box-shadow, background-color, color;

  --fallback-color: var(--ck-primary-button-color);
  --fallback-background: var(--ck-primary-button-background);
  --fallback-box-shadow: var(--ck-primary-button-box-shadow);
  --fallback-border-radius: var(--ck-primary-button-border-radius);

  --color: var(--ck-primary-button-color, var(--fallback-color));
  --background: var(--ck-primary-button-background, var(--fallback-background));
  --box-shadow: var(--ck-primary-button-box-shadow, var(--fallback-box-shadow));
  --border-radius: var(--ck-primary-button-border-radius, var(--fallback-border-radius));

  --hover-color: var(--ck-primary-button-hover-color, var(--color));
  --hover-background: var(--ck-primary-button-hover-background, var(--background));
  --hover-box-shadow: var(--ck-primary-button-hover-box-shadow, var(--box-shadow));
  --hover-border-radius: var(--ck-primary-button-hover-border-radius, var(--border-radius));

  --active-color: var(--ck-primary-button-active-color, var(--hover-color));
  --active-background: var(--ck-primary-button-active-background, var(--hover-background));
  --active-box-shadow: var(--ck-primary-button-active-box-shadow, var(--hover-box-shadow));
  --active-border-radius: var(--ck-primary-button-active-border-radius, var(--hover-border-radius));

  color: var(--color);
  background: var(--background);
  box-shadow: var(--box-shadow);
  border-radius: var(--border-radius);

  &:disabled {
    transition: 180ms ease;
  }

  &:not(:disabled) {
    &:hover {
      color: var(--hover-color);
      background: var(--hover-background);
      box-shadow: var(--hover-box-shadow);
      border-radius: var(--hover-border-radius);
    }
    &:focus-visible {
      transition-duration: 100ms;
      color: var(--hover-color);
      background: var(--hover-background);
      box-shadow: var(--hover-box-shadow);
      border-radius: var(--hover-border-radius);
    }
    &:active {
      color: var(--active-color);
      background: var(--active-background);
      box-shadow: var(--active-box-shadow);
      border-radius: var(--active-border-radius);
    }
  }
`

export const ConnectorLabel = styled(motion.span)`
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding-right: 38px;
`

export const ConnectorIcon = styled(motion.div)`
  position: absolute;
  right: 20px;
  width: 32px;
  height: 32px;
  overflow: hidden;
  svg {
    display: block;
    width: 100%;
    height: 100%;
  }
`
export const MobileConnectorsContainer = styled(motion.div)`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  padding: 14px 0 28px;
  margin: 0 0;
`

export const MobileConnectorButton = styled(motion.button)`
  --background: var(--ck-body-background-secondary);
  cursor: pointer;
  user-select: none;
  position: relative;
  padding: 0;
  width: 100%;
  min-width: 25%;
  font-size: 13px;
  font-weight: 500;
  line-height: 13px;
  text-align: center;
  transition: transform 100ms ease;

  background: none;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }

  &:not(:disabled) {
    &:active {
      transform: scale(0.97);
    }
  }
`

export const MobileConnectorLabel = styled(motion.span)`
  display: block;
  padding: 10px 0 0;
  color: var(--ck-body-color);
  opacity: 0.75;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`

export const MobileConnectorIcon = styled(motion.div)`
  margin: 0 auto;
  width: 60px;
  height: 60px;
  overflow: hidden;
  svg {
    border-radius: inherit;
    display: block;
    position: relative;
    transform: translate3d(0, 0, 0);
    width: 100%;
    height: 100%;
  }
`
