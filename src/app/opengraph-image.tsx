import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Sendikal Veri — Türkiye Sendika Veri Platformu';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
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
        {/* Glow background */}
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
        <div
          style={{
            position: 'absolute',
            bottom: -100,
            right: -100,
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)',
          }}
        />

        {/* Grid pattern overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
            zIndex: 1,
          }}
        >
          {/* Logo + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 20,
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                fontWeight: 900,
                color: 'white',
                boxShadow: '0 0 40px rgba(59,130,246,0.4)',
              }}
            >
              SV
            </div>
            <div
              style={{
                fontSize: 56,
                fontWeight: 800,
                color: 'white',
                letterSpacing: '-1px',
              }}
            >
              Sendikal Veri
            </div>
          </div>

          {/* Subtitle */}
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

          {/* Stats pills */}
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            {[
              { label: 'Sendikalar', color: '#3b82f6' },
              { label: 'İş Kolları', color: '#8b5cf6' },
              { label: 'Konfederasyonlar', color: '#10b981' },
              { label: 'İstatistikler', color: '#f59e0b' },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding: '10px 20px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${item.color}40`,
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
              marginTop: 8,
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
