import { useCurrentFrame, useVideoConfig } from 'remotion';
import { useTheme, glowText } from '../theme';
import { springIn, clamp } from '../anim';

// Авто-субтитры: показывает активную фразу по времени,
// текущее слово подсвечивается accent-цветом (караоке).
export const CaptionsAuto = ({ groups = [], offset = 520, tail = 0.15, pos = 'bottom' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = useTheme();
  const time = frame / fps;

  // активная группа
  const gi = groups.findIndex((g) => time >= g.start && time <= g.end + tail);
  if (gi < 0) return null;
  const g = groups[gi];

  // локальный кадр от начала группы — для входной анимации плашки
  const localFrame = frame - Math.round(g.start * fps);
  // plain: субтитры без тёмной подложки — слова прямо на кадре.
  const plain = !!t.plain;
  const flatShadow = t.textShadow || '0 3px 16px rgba(0,0,0,.8)';
  const idleColor = t.captionIdleColor || t.colors.milk;
  const activeColor = t.captionActiveColor || t.colors.accent;
  const activeScale = t.captionActiveScale || 1;
  const s = springIn(localFrame, fps, 0, { damping: 12, mass: 0.5 });
  const scale = clamp(s, 0, 1, 0.85, 1);

  return (
    <div style={{
      position: 'absolute', [pos]: offset, left: '50%', width: 640,
      textAlign: 'center', transform: `translateX(-50%) scale(${scale})`,
      opacity: s,
    }}>
      <div style={{
        display: 'inline-block',
        background: plain
          ? 'transparent'
          : (t.motion.glow ? 'rgba(14,14,12,.82)' : 'rgba(61,46,36,.9)'),
        border: plain ? 'none' : t.cardBorder,
        borderRadius: plain ? 0 : 18,
        padding: plain ? 0 : '16px 26px',
        boxShadow: plain ? 'none' : t.cardShadow,
        maxWidth: 640,
        fontFamily: t.fonts.display, fontWeight: 700, textTransform: 'uppercase',
        fontSize: t.captionSize || 46,
        lineHeight: t.captionLineHeight || 1.06, letterSpacing: 0.5,
      }}>
        {g.words.map((w, i) => {
          const active = time >= w.s && time <= w.e + tail;
          return (
            <span key={i} style={{
              color: active ? activeColor : idleColor,
              textShadow: plain
                ? flatShadow
                : (active ? glowText(t, t.colors.accent) : 'none'),
              transition: 'none',
              marginRight: 10,
              display: 'inline-block',
              transformOrigin: 'center bottom',
              transform: active
                ? `translateY(-4px) scale(${activeScale})`
                : 'none',
            }}>{w.w}</span>
          );
        })}
      </div>
    </div>
  );
};
