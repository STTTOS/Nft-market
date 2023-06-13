import { Inter } from 'next/font/google'
import 'react-toastify/dist/ReactToastify.css'

import './globals.css'
import NavBar from '@/components/NavBar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Nft marketplace',
  description: 'market to sell, buy nfts'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NavBar />
        {children}
      </body>
    </html>
  )
}
