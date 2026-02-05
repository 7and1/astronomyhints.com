/// <reference types="three" />

declare module 'astronomy-engine' {
  export enum Body {
    Sun = 'Sun',
    Mercury = 'Mercury',
    Venus = 'Venus',
    Earth = 'Earth',
    Mars = 'Mars',
    Jupiter = 'Jupiter',
    Saturn = 'Saturn',
    Uranus = 'Uranus',
    Neptune = 'Neptune',
    Pluto = 'Pluto',
    Moon = 'Moon',
  }

  export interface Vector {
    x: number;
    y: number;
    z: number;
    t: AstroTime;
  }

  export class AstroTime {
    constructor(date: Date);
    date: Date;
  }

  export function HelioVector(body: Body, date: Date): Vector;
  export function GeoVector(body: Body, date: Date, aberration: boolean): Vector;
}
