import { ImageResponse } from 'next/og';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Node runtime kullan (dosya sistemi erişimi için)
export const runtime = 'nodejs';
export const alt = 'Sendikal Veri — Türkiye Sendika Veri Platformu';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  // Logoyu binary olarak oku ve base64'e çevir
  const logoBuffer = readFileSync(join(process.cwd(), 'public', 'sv-logo.png'));
  const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#09090b',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Sol glow */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            left: -100,
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)',
          }}
        />
        {/* Sağ glow */}
        <div
          style={{
            position: 'absolute',
            bottom: -100,
            right: -100,
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,130,246,0.15) 0%, transparent 70%)',
          }}
        />
        {/* Grid arka plan */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* İçerik */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
            zIndex: 1,
          }}
        >
          {/* Logo + Başlık */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoBase64}
              alt="Sendikal Veri Logo"
              width={100}
              height={100}
              style={{ objectFit: 'contain', filter: 'drop-shadow(0 0 20px rgba(59,130,246,0.5))' }}
            />
            <div
              style={{
                fontSize: 60,
                fontWeight: 800,
                color: 'white',
                letterSpacing: '-1px',
              }}
            >
              Sendikal Veri
            </div>
          </div>

          {/* Alt başlık */}
          <div
            style={{
              fontSize: 26,
              color: '#71717a',
              textAlign: 'center',
              maxWidth: 700,
            }}
          >
            Türkiye İşçi ve Kamu Sendikası Veri Platformu
          </div>

          {/* Kategori pills */}
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            {[
              { label: 'Sendikalar', color: '#3b82f6' },
              { label: 'İş Kolları', color: '#6366f1' },
              { label: 'Konfederasyonlar', color: '#8b5cf6' },
              { label: 'İstatistikler', color: '#a78bfa' },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding: '10px 20px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${item.color}50`,
                  color: item.color,
                  fontSize: 18,
                  fontWeight: 600,
                }}
              >
                {item.label}
              </div>
            ))}
          </div>

          {/* Domain */}
          <div
            style={{
              marginTop: 4,
              fontSize: 18,
              color: '#3f3f46',
              letterSpacing: '0.05em',
            }}
          >
            sendikalveri.com
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
