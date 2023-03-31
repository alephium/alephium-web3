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
const WalletConnect = ({ background = false, ...props }) => (
  <svg
    {...props}
    aria-hidden="true"
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={background ? { background: 'var(--ck-brand-walletConnect)' } : undefined}
  >
    <path
      d="M9.58818 11.8556C13.1293 8.31442 18.8706 8.31442 22.4117 11.8556L22.8379 12.2818C23.015 12.4588 23.015 12.7459 22.8379 12.9229L21.3801 14.3808C21.2915 14.4693 21.148 14.4693 21.0595 14.3808L20.473 13.7943C18.0026 11.3239 13.9973 11.3239 11.5269 13.7943L10.8989 14.4223C10.8104 14.5109 10.6668 14.5109 10.5783 14.4223L9.12041 12.9645C8.94336 12.7875 8.94336 12.5004 9.12041 12.3234L9.58818 11.8556ZM25.4268 14.8706L26.7243 16.1682C26.9013 16.3452 26.9013 16.6323 26.7243 16.8093L20.8737 22.6599C20.6966 22.8371 20.4096 22.8371 20.2325 22.6599L16.0802 18.5076C16.0359 18.4634 15.9641 18.4634 15.9199 18.5076L11.7675 22.6599C11.5905 22.8371 11.3034 22.8371 11.1264 22.66C11.1264 22.66 11.1264 22.6599 11.1264 22.6599L5.27561 16.8092C5.09856 16.6322 5.09856 16.3451 5.27561 16.168L6.57313 14.8706C6.75019 14.6934 7.03726 14.6934 7.21431 14.8706L11.3668 19.023C11.411 19.0672 11.4828 19.0672 11.5271 19.023L15.6793 14.8706C15.8563 14.6934 16.1434 14.6934 16.3205 14.8706L20.473 19.023C20.5172 19.0672 20.589 19.0672 20.6332 19.023L24.7856 14.8706C24.9627 14.6935 25.2498 14.6935 25.4268 14.8706Z"
      fill={background ? 'white' : 'var(--ck-brand-walletConnect)'}
    />
  </svg>
)
/*
export const WalletConnectQRCode = ({ ...props }) => (
  <svg
    {...props}
    width="76"
    height="54"
    viewBox="0 0 76 54"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M51 0H21V5H15V9H11V14H5V20H0V39H5V40H11V44H16V49H21V54H27H30H35V49H41V54H46H50H55V50H60V44H65V39H66H70H76V20H70V14H66V9H61V5H55V0H51ZM24 39V40H26V39H24ZM51 38H50V40H51V38Z"
      fill="var(--ck-body-background)"
    />
    <path
      d="M20.5813 16.0338C29.807 6.65539 44.7645 6.65539 53.9901 16.0338L55.1004 17.1625C55.5619 17.6313 55.5619 18.3917 55.1004 18.8605L51.3024 22.7217C51.0716 22.956 50.6977 22.956 50.4672 22.7217L48.9392 21.1684C42.5031 14.6258 32.0684 14.6258 25.6323 21.1684L23.9961 22.8316C23.7654 23.0662 23.3915 23.0662 23.1609 22.8316L19.3627 18.9707C18.9014 18.5018 18.9014 17.7415 19.3627 17.2727L20.5813 16.0338ZM61.8452 24.0187L65.2255 27.4553C65.6867 27.9241 65.6867 28.6844 65.2255 29.1533L49.9831 44.6481C49.5219 45.1172 48.7739 45.1172 48.3127 44.6481L37.4948 33.651C37.3792 33.5339 37.1923 33.5339 37.077 33.651L26.2591 44.6481C25.7979 45.1172 25.05 45.1172 24.5888 44.6484C24.5887 44.6484 24.5887 44.6481 24.5887 44.6481L9.34595 29.153C8.88468 28.6841 8.88468 27.9238 9.34595 27.455L12.7263 24.0187C13.1876 23.5495 13.9355 23.5495 14.3968 24.0187L25.215 35.0161C25.3303 35.1332 25.5174 35.1332 25.6326 35.0161L36.4503 24.0187C36.9115 23.5495 37.6594 23.5495 38.1209 24.0187L48.9392 35.0161C49.0544 35.1332 49.2414 35.1332 49.3566 35.0161L60.1746 24.0187C60.6361 23.5498 61.384 23.5498 61.8452 24.0187Z"
      fill="var(--ck-brand-walletConnect)"
    />
  </svg>
);
*/

const Ledger = ({ ...props }) => (
  <svg
    {...props}
    aria-hidden="true"
    width="88"
    height="88"
    viewBox="0 0 88 88"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ background: 'black' }}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M37.2106 16H16V29.4577H19.2182V19.2182L37.2106 19.1011V16ZM37.3568 33.4073V54.6179H50.8146V51.3997H40.575L40.458 33.4073H37.3568ZM16 72.1714H37.2106V69.0703L19.2182 68.9533V58.7137H16V72.1714ZM50.9609 16H72.1714V29.4577H68.9533V19.2182L50.9609 19.1011V16ZM72.1714 72.1714H50.9609V69.0703L68.9533 68.9533V58.7137H72.1714V72.1714Z"
      fill="white"
    />
  </svg>
)

const AlephiumIcon = ({ ...props }) => {
  return (
    <svg
      {...props}
      version="1.0"
      xmlns="http://www.w3.org/2000/svg"
      width="36.000000pt"
      height="36.000000pt"
      viewBox="0 0 108.000000 108.000000"
      preserveAspectRatio="xMidYMid meet"
    >
      <g transform="translate(0.000000,108.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
        <path
          d="M655 871 l-30 -6 -3 -108 -3 -109 31 6 c16 3 44 9 60 12 l30 6 0 104
0 104 -27 -1 c-16 -1 -41 -4 -58 -8z"
        />
        <path
          d="M381 831 c-19 -3 -36 -10 -37 -16 -2 -5 54 -136 124 -290 l128 -280
64 3 c35 1 68 6 73 11 5 5 -48 133 -120 292 l-129 284 -34 1 c-19 1 -50 -1
-69 -5z"
        />
        <path
          d="M390 426 l-55 -11 -3 -114 -3 -114 52 7 c90 12 90 12 87 133 -2 60
-7 107 -13 109 -5 1 -35 -3 -65 -10z"
        />
      </g>
    </svg>
  )
}

export const PlaceHolder = () => {
  return <div style={{ width: 80, height: 80, background: '#555' }}></div>
}

export default {
  AlephiumIcon,
  WalletConnect,
  Ledger
}
