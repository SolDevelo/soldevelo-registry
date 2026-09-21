import { readFile } from "node:fs/promises"
import { join } from "node:path"

import { ImageResponse } from "next/og"

import { siteConfig } from "@/config/site"

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = "image/png"

// The palette, matching app/globals.css. Satori resolves no CSS variables, so the
// card repeats the values rather than reading tokens.
const BRAND = "#1589CB"
const NAVY = "#004C8B"
const INK = "#0a0a0a"
const MUTED = "#5b6472"
const LINE = "#e5e7eb"

async function loadGoogleFont(
  family: string,
  weight: number
): Promise<ArrayBuffer> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    family
  )}:wght@${weight}`
  const css = await fetch(cssUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)",
    },
  }).then((response) => response.text())

  const src = css.match(/src:\s*url\((https:[^)]+)\)/)?.[1]
  if (!src) throw new Error(`Font not found: ${family} ${weight}`)
  return fetch(src).then((response) => response.arrayBuffer())
}

type LoadedFont = {
  name: string
  data: ArrayBuffer
  weight: 400 | 500 | 700
  style: "normal"
}

// Memoized per lambda instance: the fonts are identical for every card.
let fontsPromise: Promise<LoadedFont[]> | null = null

function getFonts(): Promise<LoadedFont[]> {
  fontsPromise ??= (async () => {
    try {
      const [bold, medium, regular] = await Promise.all([
        loadGoogleFont("Geist", 700),
        loadGoogleFont("Geist", 500),
        loadGoogleFont("Geist", 400),
      ])
      return [
        { name: "Geist", data: bold, weight: 700, style: "normal" },
        { name: "Geist", data: medium, weight: 500, style: "normal" },
        { name: "Geist", data: regular, weight: 400, style: "normal" },
      ] satisfies LoadedFont[]
    } catch {
      // A font fetch failure must degrade to the default face, not a broken card.
      return []
    }
  })()
  return fontsPromise
}

// Satori cannot fetch a remote image at render time, and these cards are generated
// during the build, when the site is not serving yet. Read the real brand assets
// off disk and inline them instead of redrawing the mark by hand.
let brandPromise: Promise<{ mark: string; wordmark: string }> | null = null

function readBrandAsset(file: string): Promise<Buffer> {
  return readFile(join(process.cwd(), "public", file))
}

function getBrand(): Promise<{ mark: string; wordmark: string }> {
  brandPromise ??= (async () => {
    const [mark, wordmark] = await Promise.all([
      readBrandAsset("soldevelo-mark.svg"),
      readBrandAsset("soldevelo.png"),
    ])

    return {
      mark: `data:image/svg+xml;base64,${mark.toString("base64")}`,
      wordmark: `data:image/png;base64,${wordmark.toString("base64")}`,
    }
  })()
  return brandPromise
}

function Chevron({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="m9 18 6-6-6-6"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export type OgImageOptions = {
  title: string
  eyebrow?: string
  description?: string
  cta?: string
}

export async function createOgImage({
  title,
  eyebrow,
  description,
  cta = "Browse The Registry",
}: OgImageOptions) {
  const [fonts, brand] = await Promise.all([getFonts(), getBrand()])

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#ffffff",
        backgroundImage: `radial-gradient(circle at 88% 6%, rgba(21,137,203,0.16), transparent 42%), radial-gradient(circle at 4% 100%, rgba(0,76,139,0.08), transparent 38%)`,
        padding: 72,
        fontFamily: "Geist",
        color: INK,
      }}
    >
      {/* The mark, oversized and barely there, so the card is recognisably ours
          even at the size a timeline renders it. */}
      <img
        src={brand.mark}
        width={520}
        height={515}
        alt=""
        style={{
          position: "absolute",
          top: 120,
          right: -110,
          opacity: 0.06,
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <img src={brand.wordmark} width={214} height={44} alt="" />
        <span style={{ fontSize: 30, color: LINE }}>/</span>
        <span style={{ fontWeight: 500, fontSize: 30, color: MUTED }}>
          Registry
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {eyebrow ? (
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <img src={brand.mark} width={30} height={30} alt="" />
            <span
              style={{
                fontWeight: 500,
                fontSize: 21,
                letterSpacing: 3,
                color: BRAND,
              }}
            >
              {eyebrow.slice(0, 40).toUpperCase()}
            </span>
          </div>
        ) : null}
        <span
          style={{
            fontWeight: 700,
            fontSize: 64,
            lineHeight: 1.08,
            letterSpacing: -2.5,
            maxWidth: 900,
          }}
        >
          {title}
        </span>
        {description ? (
          <span
            style={{
              fontWeight: 400,
              fontSize: 25,
              lineHeight: 1.45,
              color: MUTED,
              maxWidth: 820,
            }}
          >
            {description.slice(0, 120)}
          </span>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: NAVY,
            color: "#ffffff",
            borderRadius: 12,
            padding: "16px 22px 16px 28px",
            fontWeight: 500,
            fontSize: 24,
          }}
        >
          {cta.slice(0, 36)}
          <Chevron color="#ffffff" />
        </div>
        <span style={{ fontWeight: 500, fontSize: 24, color: MUTED }}>
          {siteConfig.DOMAIN}
        </span>
      </div>

      {/* Brand rule along the bottom edge, so the card reads as a card on the
          white backgrounds most social clients use. */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: 10,
          backgroundImage: `linear-gradient(90deg, ${NAVY}, ${BRAND})`,
        }}
      />
    </div>,
    { ...OG_SIZE, ...(fonts.length ? { fonts } : {}) }
  )
}
