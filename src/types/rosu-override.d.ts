interface RosuArgs {
    path: string,
    params: RosuParam[],
}

interface RosuParam {
    mods?: number,
    acc?: number,
    nMisses?: number,
    combo?: number,
}

interface RosuObject {
    mode: number,
    stars: number,
    pp: number,
    ppAcc: number,
    ppAim: number,
    ppFlashlight: number,
    ppSpeed: number,
    ppStrain: number,
    nFruits: number,
    nDroplets: number,
    nTinyDroplets: number,
    aimStrain: number,
    speedStrain: number,
    flashlightRating: number,
    sliderFactor: number,
    ar: number,
    cs: number,
    hp: number,
    od: number,
    bpm: number,
    clockRate: number,
    nCircles: number,
    nSliders: number,
    nSpinners: number,
    maxCombo: number,
}

declare namespace Rosu {
    export function calculate(args: RosuArgs): RosuObject[];
}

export = Rosu;
