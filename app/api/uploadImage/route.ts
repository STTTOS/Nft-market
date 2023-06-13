import type { NextRequest } from 'next/server'

import axios from 'axios'
import { NextResponse } from 'next/server'

export interface PinResponse {
  IpfsHash: string
  PinSize: number
  Timestamp: string
}
export async function POST(req: NextRequest) {
  const formData = await req.formData()

  const res = await axios.post(
    'https://api.pinata.cloud/pinning/pinFileToIPFS',
    formData,
    {
      maxBodyLength: Infinity,
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${process.env.PINATA_JWT}`
      }
    }
  )
  const { IpfsHash } = res.data as PinResponse
  return NextResponse.json({
    url: `${process.env.PINATA_DOMAIN}${IpfsHash}`
  })
}
