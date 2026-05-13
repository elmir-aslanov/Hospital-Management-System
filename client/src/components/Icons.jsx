/* eslint-disable */
function makeIcon(paths) {
  return function Icon({ size = 24, className = "", strokeWidth = 2, ...rest }) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={strokeWidth}
        strokeLinecap="round" strokeLinejoin="round"
        className={className} aria-hidden="true" {...rest}>
        {paths}
      </svg>
    );
  };
}

const Icons = {};
Icons.Stethoscope = makeIcon(<><path d="M11 2v2a3 3 0 0 1-3 3H6a3 3 0 0 0-3 3v3a3 3 0 0 0 3 3h.5a4.5 4.5 0 0 0 9 0v-.5a4.5 4.5 0 0 1 4.5-4.5"/><circle cx="20" cy="9" r="2"/></>);
Icons.Heart = makeIcon(<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>);
Icons.HeartPulse = makeIcon(<path d="M3 12h4l3-9 4 18 3-9h4"/>);
Icons.Brain = makeIcon(<><path d="M12 5a3 3 0 1 0-5.997.142 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 0 0 12 21Z"/><path d="M12 5a3 3 0 1 1 5.997.142 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 0 1 12 21Z"/></>);
Icons.Syringe = makeIcon(<><path d="m18 2 4 4-9 9-4 1 1-4Z"/><path d="m11 5 6 6"/><path d="M3 21v-4l3-3 4 4-3 3Z"/></>);
Icons.Pill = makeIcon(<path d="M10.5 20.5 4 14a4 4 0 0 1 5.5-5.5l1 1L19 1l4 4-8.5 8.5 1 1A4 4 0 0 1 10.5 20.5Z"/>);
Icons.Calendar = makeIcon(<><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>);
Icons.Bed = makeIcon(<path d="M2 18v-7a4 4 0 0 1 4-4h6v4h10v7M2 14h20M6 11V8"/>);
Icons.User = makeIcon(<><circle cx="12" cy="7" r="4"/><path d="M5 21c0-3.866 3.134-7 7-7s7 3.134 7 7"/></>);
Icons.Shield = makeIcon(<path d="M12 2 4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6Z"/>);
Icons.Award = makeIcon(<><circle cx="12" cy="9" r="6"/><path d="m8 14-2 8 6-3 6 3-2-8"/></>);
Icons.Clock = makeIcon(<><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 2"/></>);
Icons.Globe = makeIcon(<><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a14 14 0 0 1 0 20M12 2a14 14 0 0 0 0 20"/></>);
Icons.Star = makeIcon(<path d="M12 2 15.09 8.26 22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27 8.91 8.26Z"/>);
Icons.MapPin = makeIcon(<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>);
Icons.Phone = makeIcon(<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z"/>);
Icons.Mail = makeIcon(<><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>);
Icons.ArrowRight = makeIcon(<path d="M5 12h14M13 6l6 6-6 6"/>);
Icons.ChevronDown = makeIcon(<path d="m6 9 6 6 6-6"/>);
Icons.Check = makeIcon(<path d="M20 6 9 17l-5-5"/>);
Icons.AlertCircle = makeIcon(<><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></>);
Icons.Sparkles = makeIcon(<><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/><path d="M5 3v4M19 17v4M3 5h4M17 19h4"/></>);
Icons.Search = makeIcon(<><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></>);
Icons.Menu = makeIcon(<><path d="M3 12h18M3 6h18M3 18h18"/></>);
Icons.X = makeIcon(<path d="M18 6 6 18M6 6l12 12"/>);
Icons.TrendingUp = makeIcon(<><path d="M3 3v18h18"/><path d="m7 16 4-8 4 5 5-9"/></>);
Icons.FileText = makeIcon(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M9 13h6M9 17h6"/></>);
Icons.Settings = makeIcon(<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .7.4 1.31 1 1.51H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>);
Icons.Bell = makeIcon(<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 0 0 4 0"/>);
Icons.LogOut = makeIcon(<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>);
Icons.PanelLeft = makeIcon(<><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></>);
Icons.MoreVertical = makeIcon(<><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></>);
Icons.Plus = makeIcon(<path d="M12 5v14M5 12h14"/>);
Icons.Download = makeIcon(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></>);
Icons.Filter = makeIcon(<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46"/>);
Icons.Edit = makeIcon(<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z"/></>);
Icons.Trash = makeIcon(<><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>);
Icons.Microscope = makeIcon(<><path d="M6 18h8M3 22h18M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/></>);
Icons.Ambulance = makeIcon(<><path d="M10 10H6M8 8v4"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><path d="M8 8H1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2"/><circle cx="7" cy="18" r="2"/><path d="M9 18h6"/><circle cx="17" cy="18" r="2"/></>);

export default Icons;
