import { useOrbitStore, type RenderQuality } from '@/lib/store';
import { isPlanetName } from '@/lib/planets';

const MAX_SPEED = 365;

type OrbitShareableState = {
  selectedPlanet: string | null;
  timeSpeed: number;
  currentDate: Date;
  showOrbits: boolean;
  showLabels: boolean;
  cinematicPlaying: boolean;
  renderQuality: RenderQuality;
};

function clampInt(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function parseBooleanParam(value: string | null) {
  if (value === null) return null;
  if (value === '1' || value.toLowerCase() === 'true') return true;
  if (value === '0' || value.toLowerCase() === 'false') return false;
  return null;
}

export function buildOrbitShareUrl(location: Location, state: OrbitShareableState) {
  const url = new URL(location.pathname, location.origin);
  const params = url.searchParams;

  params.set('v', '1');

  if (state.selectedPlanet) params.set('planet', state.selectedPlanet);

  if (state.timeSpeed !== 1) params.set('speed', String(Math.round(state.timeSpeed)));

  if (state.renderQuality !== 'balanced') params.set('q', state.renderQuality);

  if (!state.showOrbits) params.set('o', '0');
  if (!state.showLabels) params.set('l', '0');

  if (state.cinematicPlaying && !state.selectedPlanet) params.set('cin', '1');

  params.set('t', String(state.currentDate.getTime()));

  return url.toString();
}

export function applyOrbitShareStateFromUrl(search: string) {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);

  const renderQuality = params.get('q');
  if (renderQuality === 'high' || renderQuality === 'balanced' || renderQuality === 'low') {
    useOrbitStore.getState().setRenderQuality(renderQuality);
  }

  const speedParam = params.get('speed');
  if (speedParam) {
    const speed = clampInt(Number.parseInt(speedParam, 10), 0, MAX_SPEED);
    if (Number.isFinite(speed)) useOrbitStore.getState().setTimeSpeed(speed);
  }

  const timeParam = params.get('t');
  if (timeParam) {
    const timestampMs = Number.parseInt(timeParam, 10);
    const nextDate = new Date(timestampMs);
    if (Number.isFinite(timestampMs) && !Number.isNaN(nextDate.getTime())) {
      useOrbitStore.getState().setCurrentDate(nextDate);
      useOrbitStore.getState().updatePlanetPositions();
    }
  }

  const showOrbits = parseBooleanParam(params.get('o'));
  if (showOrbits !== null) {
    const state = useOrbitStore.getState();
    if (state.showOrbits !== showOrbits) state.toggleOrbits();
  }

  const showLabels = parseBooleanParam(params.get('l'));
  if (showLabels !== null) {
    const state = useOrbitStore.getState();
    if (state.showLabels !== showLabels) state.toggleLabels();
  }

  const planet = params.get('planet');
  if (planet && isPlanetName(planet)) {
    useOrbitStore.getState().setSelectedPlanet(planet);
  }

  const cinematic = parseBooleanParam(params.get('cin'));
  if (cinematic === true && !planet) {
    const state = useOrbitStore.getState();
    if (!state.cinematicPlaying) state.toggleCinematic();
  }
}

