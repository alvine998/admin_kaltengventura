import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="description" content="Kaltengventura" />
        <meta name="author" content="Alvine Yoga" />
        <meta name="generator" content="Sancode" />
        <title>Kaltengventura</title>
      </Head>
      <Component {...pageProps} />
    </>
  )
}
