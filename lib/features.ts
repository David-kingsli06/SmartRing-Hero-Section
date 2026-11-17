export interface Feature {
  id: string;
  statNumber: string;
  statLabel: string;
  footnote?: string;
  holdStart: number;
  holdEnd: number;
  centerP: number;
  // Position as percentage of viewport/frame
  anchor: {
    x: number;
    y: number;
  };
  // Leader line endpoint (edge of right column stat panel)
  panelTarget: {
    x: number;
    y: number;
  };
}

// Wider holds (0.08 wide each) so the user has substantial scroll distance
// to read the typography and statistics comfortably while the ring remains pinned.
export const FEATURES: Feature[] = [
  {
    id: "sleep",
    statNumber: "[X] hrs",
    statLabel: "Sleep tracked nightly",
    footnote: "*Placeholder",
    holdStart: 0.30,
    holdEnd: 0.38,
    centerP: 0.34,
    anchor: {
      x: 58,
      y: 42,
    },
    panelTarget: {
      x: 72,
      y: 50,
    },
  },
  {
    id: "heart-rate",
    statNumber: "[X] bpm",
    statLabel: "Heart rate, all day",
    footnote: "*Placeholder",
    holdStart: 0.44,
    holdEnd: 0.52,
    centerP: 0.48,
    anchor: {
      x: 62,
      y: 48,
    },
    panelTarget: {
      x: 72,
      y: 50,
    },
  },
  {
    id: "recovery",
    statNumber: "[X]%",
    statLabel: "Recovery score each morning",
    footnote: "*Placeholder",
    holdStart: 0.58,
    holdEnd: 0.66,
    centerP: 0.62,
    anchor: {
      x: 60,
      y: 58,
    },
    panelTarget: {
      x: 72,
      y: 50,
    },
  },
];
