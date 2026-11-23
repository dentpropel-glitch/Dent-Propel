export type GrowthNodeId =
  | 'marketing'
  | 'inquiries'
  | 'lead-management'
  | 'follow-up'
  | 'appointments';

export interface GrowthNodeSpec {
  id: GrowthNodeId;
  code: string;
  label: string;
  cardTitle: string;
  sampleLine: string;
  sampleDetail: string;
  angleRad: number;
  baseRadius: number;
  elevation: number;
  accentHexLight: number;
  accentHexDark: number;
}

export const HERO_GROWTH_NODES: GrowthNodeSpec[] = [
  {
    id: 'marketing',
    code: '01',
    label: 'Marketing',
    cardTitle: 'Campaign Overview',
    sampleLine: 'Implant & Aligner Campaigns',
    sampleDetail: 'Local reach & educational reels active',
    angleRad: -Math.PI * 0.65,
    baseRadius: 3.15,
    elevation: 0.72,
    accentHexLight: 0x087d94,
    accentHexDark: 0x22d3d5,
  },
  {
    id: 'inquiries',
    code: '02',
    label: 'Patient Inquiries',
    cardTitle: 'Inquiry Received',
    sampleLine: 'Orthodontic Consult Inquiry',
    sampleDetail: 'Captured via landing form · Source tagged',
    angleRad: -Math.PI * 0.18,
    baseRadius: 3.25,
    elevation: 1.05,
    accentHexLight: 0x13afa8,
    accentHexDark: 0x43b5ec,
  },
  {
    id: 'lead-management',
    code: '03',
    label: 'Lead Management',
    cardTitle: 'Pipeline Organized',
    sampleLine: 'Stage: Contacted',
    sampleDetail: 'Assigned to front-desk coordinator',
    angleRad: Math.PI * 0.22,
    baseRadius: 3.05,
    elevation: 0.45,
    accentHexLight: 0x2563eb,
    accentHexDark: 0x6476ed,
  },
  {
    id: 'follow-up',
    code: '04',
    label: 'Automated Follow-Up',
    cardTitle: 'Follow-Up Scheduled',
    sampleLine: '24h Reception Reminder',
    sampleDetail: 'Automated acknowledgment sent',
    angleRad: Math.PI * 0.62,
    baseRadius: 3.3,
    elevation: 0.88,
    accentHexLight: 0x0e9384,
    accentHexDark: 0x2dd4bf,
  },
  {
    id: 'appointments',
    code: '05',
    label: 'Appointments',
    cardTitle: 'Appointment Request',
    sampleLine: 'Thursday Consultation Slot',
    sampleDetail: 'Reception confirmation handoff ready',
    angleRad: Math.PI * 0.96,
    baseRadius: 3.1,
    elevation: 0.6,
    accentHexLight: 0x087d94,
    accentHexDark: 0x38bdf8,
  },
];

export interface Vec3Tuple {
  x: number;
  y: number;
  z: number;
}

export function computeOrbitPosition(
  angleRad: number,
  baseRadius: number,
  elevation: number,
  spreadFactor = 1,
): Vec3Tuple {
  const r = baseRadius * spreadFactor;
  return {
    x: Math.cos(angleRad) * r,
    y: elevation * (0.75 + 0.25 * spreadFactor),
    z: Math.sin(angleRad) * r,
  };
}

export function sampleQuadraticBezierPoint(
  start: Vec3Tuple,
  control: Vec3Tuple,
  end: Vec3Tuple,
  t: number,
): Vec3Tuple {
  const clamped = Math.max(0, Math.min(1, t));
  const inv = 1 - clamped;
  const invSq = inv * inv;
  const twoInvT = 2 * inv * clamped;
  const tSq = clamped * clamped;

  return {
    x: invSq * start.x + twoInvT * control.x + tSq * end.x,
    y: invSq * start.y + twoInvT * control.y + tSq * end.y,
    z: invSq * start.z + twoInvT * control.z + tSq * end.z,
  };
}

export interface PipelineStage3DSpec {
  index: number;
  code: string;
  label: string;
  position: Vec3Tuple;
  cameraPosition: Vec3Tuple;
  lookAt: Vec3Tuple;
}

export const PIPELINE_STAGE_SPECS: PipelineStage3DSpec[] = [
  {
    index: 0,
    code: '01',
    label: 'ATTRACT',
    position: { x: -4.4, y: 0.15, z: 0.5 },
    cameraPosition: { x: -2.4, y: 3.1, z: 6.8 },
    lookAt: { x: -1.6, y: 0.8, z: 0 },
  },
  {
    index: 1,
    code: '02',
    label: 'CAPTURE',
    position: { x: -2.2, y: 0.45, z: -0.35 },
    cameraPosition: { x: -1.1, y: 3.25, z: 6.6 },
    lookAt: { x: -0.8, y: 0.9, z: -0.1 },
  },
  {
    index: 2,
    code: '03',
    label: 'FOLLOW UP',
    position: { x: 0, y: 0.78, z: 0.15 },
    cameraPosition: { x: 0, y: 3.4, z: 6.7 },
    lookAt: { x: 0, y: 1.0, z: 0 },
  },
  {
    index: 3,
    code: '04',
    label: 'BOOK',
    position: { x: 2.2, y: 1.08, z: -0.3 },
    cameraPosition: { x: 1.2, y: 3.55, z: 6.6 },
    lookAt: { x: 0.8, y: 1.1, z: -0.1 },
  },
  {
    index: 4,
    code: '05',
    label: 'OPTIMIZE',
    position: { x: 4.4, y: 1.4, z: 0.45 },
    cameraPosition: { x: 2.4, y: 3.65, z: 6.8 },
    lookAt: { x: 1.6, y: 1.2, z: 0 },
  },
];

export function computeStageCameraPreset(stageIndex: number): PipelineStage3DSpec {
  const safeIndex = Math.max(
    0,
    Math.min(PIPELINE_STAGE_SPECS.length - 1, Math.floor(stageIndex)),
  );
  return PIPELINE_STAGE_SPECS[safeIndex];
}
