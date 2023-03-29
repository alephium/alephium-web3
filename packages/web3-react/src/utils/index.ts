import React from 'react';
import { detect } from 'detect-browser';

export const detectBrowser = () => {
  const browser = detect();
  return browser?.name ?? '';
};

const detectOS = () => {
  const browser = detect();
  return browser?.os ?? '';
};

const isIOS = () => {
  const os = detectOS();
  return os.toLowerCase().includes('ios');
};

const isAndroid = () => {
  const os = detectOS();
  return os.toLowerCase().includes('android');
};

export const isMobile = () => {
  return isAndroid() || isIOS();
};

type ReactChildArray = ReturnType<typeof React.Children.toArray>;
export function flattenChildren(children: React.ReactNode): ReactChildArray {
  const childrenArray = React.Children.toArray(children);
  return childrenArray.reduce((flatChildren: ReactChildArray, child) => {
    if ((child as React.ReactElement<any>).type === React.Fragment) {
      return flatChildren.concat(
        flattenChildren((child as React.ReactElement<any>).props.children)
      );
    }
    flatChildren.push(child);
    return flatChildren;
  }, []);
}

export const truncatedAddress = (address: string) => {
  const start = address.slice(0, 6)
  const end = address.slice(-6)
  return `${start} ... ${end}`
}
