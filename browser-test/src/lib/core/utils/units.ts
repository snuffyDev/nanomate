const CSSUnitMap = {
    "%": "%",
    px: "px",
    em: "em",
    rem: "rem",
    vw: "vw",
    vh: "vh",
    vmin: "vmin",
    vmax: "vmax",
    pt: "pt",
    pc: "pc",
    in: "in",
    mm: "mm",
    cm: "cm",
  } as const;

type CSSUnit = keyof typeof CSSUnitMap

function convertUnits(fromValue: string | number, toUnit: CSSUnit): number {
    if (typeof fromValue === 'number') fromValue = fromValue.toString() + toUnit;
    const parseValue = (valueUnit: string): [number, CSSUnit] => {
      const value = parseFloat(valueUnit);
      if (isNaN(value)) {
        throw new Error(`Invalid value: ${valueUnit}`);
      }
      const unit = valueUnit.replace(value.toString(), '') as CSSUnit;
      return [value, unit];
    };

    const [from, fromUnit] = parseValue(fromValue);
    const to = CSSUnitMap[toUnit];

    if (fromUnit === "%" && to === "px") {
      return (from / 100) * window.innerWidth;
    }

    if (fromUnit === "px" && to === "%") {
      return (from / window.innerWidth) * 100;
    }

    const conversionTable: { [key in Exclude<CSSUnit, 'px' | '%'>]: number } = {
      // Absolute length units
      in: 96,
      cm: 37.8,
      mm: 3.78,
      pt: 1.33,
      pc: 16,

      // Relative length units
      em: parseFloat(getComputedStyle(document.documentElement).fontSize || "16px"),
      rem: parseFloat(getComputedStyle(document.documentElement).fontSize || "16px"),
      vw: window.innerWidth / 100,
      vh: window.innerHeight / 100,
      vmin: Math.min(window.innerWidth, window.innerHeight) / 100,
      vmax: Math.max(window.innerWidth, window.innerHeight) / 100,
    };

    const fromPixels = from * conversionTable[fromUnit as never];
    return fromPixels / conversionTable[to as never];
  }

  export { convertUnits, CSSUnitMap };
