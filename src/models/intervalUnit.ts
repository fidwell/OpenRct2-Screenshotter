enum IntervalUnitLabel {
  Days = "in-game days",
  Months = "in-game months",
  Years = "in-game years",
  Ticks = "ticks",
  Seconds = "real-time seconds",
  Minutes = "real-time minutes",
  Hours = "real-time hours"
}

export enum IntervalUnitId {
  Days = 0,
  Months = 1,
  Years = 2,
  Ticks = 3,
  Seconds = 4,
  Minutes = 5,
  Hours = 6
}

export default class IntervalUnit {
  id: number;

  label: string;

  static all: IntervalUnit[] = [
    new IntervalUnit(IntervalUnitId.Days, IntervalUnitLabel.Days),
    new IntervalUnit(IntervalUnitId.Months, IntervalUnitLabel.Months),
    new IntervalUnit(IntervalUnitId.Years, IntervalUnitLabel.Years),
    new IntervalUnit(IntervalUnitId.Ticks, IntervalUnitLabel.Ticks),
    new IntervalUnit(IntervalUnitId.Seconds, IntervalUnitLabel.Seconds),
    new IntervalUnit(IntervalUnitId.Minutes, IntervalUnitLabel.Minutes),
    new IntervalUnit(IntervalUnitId.Hours, IntervalUnitLabel.Hours),
  ];

  constructor(id: number, label: string) {
    this.id = id;
    this.label = label;
  }

  static getDefault(): IntervalUnit {
    return IntervalUnit.all[0];
  }
}
