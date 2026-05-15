export default function WaveDivider({
  fromColor = '#ffffff',
  toColor   = '#ffffff',
  height    = 120,
}) {
  return (
    <div style={{
      position:   'relative',
      height:     `${height}px`,
      overflow:   'hidden',
      background: fromColor,
      lineHeight: 0,
      marginTop:  -2,
      marginBottom: -2,
    }}>
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', bottom: 0, width: '100%', height: '100%' }}
      >
        <path
          d="M0,40 C180,90 360,10 540,50 C720,90 900,20 1080,55 C1260,88 1380,30 1440,45 L1440,120 L0,120 Z"
          fill={toColor} opacity="0.25"
        />
        <path
          d="M0,55 C200,20 400,95 600,65 C800,35 1000,85 1200,60 C1320,45 1400,70 1440,75 L1440,120 L0,120 Z"
          fill={toColor} opacity="0.4"
        />
        <path
          d="M0,70 C150,45 350,100 550,78 C750,55 950,95 1150,72 C1300,55 1400,80 1440,85 L1440,120 L0,120 Z"
          fill={toColor} opacity="0.6"
        />
        <path
          d="M0,85 C200,65 420,108 640,92 C860,76 1080,105 1280,88 C1370,80 1420,92 1440,96 L1440,120 L0,120 Z"
          fill={toColor} opacity="0.8"
        />
        <path
          d="M0,100 C180,82 380,112 580,102 C780,92 980,110 1180,100 C1320,93 1400,103 1440,106 L1440,120 L0,120 Z"
          fill={toColor} opacity="1"
        />
      </svg>
    </div>
  );
}
