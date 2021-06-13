import * as Environment from "../environment";
import * as Log from "./logger";
import Capturer from "./capturer";
import { IntervalUnitId } from "../models/intervalUnit";
import Storage from "./storage";

export default class Timer {
  private inGameSubscription: IDisposable = null;

  private realTimeSubscription: number = 0;

  private sleeps: number = 0;

  constructor() {
    if (Storage.getIsEnabled()) {
      this.enable();
    } else {
      this.disable();
    }
  }

  public enable(): void {
    Storage.setIsEnabled(true);

    const interval = Storage.getInterval();

    let alertInterval = "";
    switch (interval.unit.id) {
      case IntervalUnitId.Days:
        alertInterval = `${interval.amount} days`;
        this.setInGameTime("interval.day");
        break;
      case IntervalUnitId.Months:
        alertInterval = `${interval.amount} months`;
        this.setInGameTime("interval.day");
        break;
      case IntervalUnitId.Years:
        alertInterval = `${interval.amount} years`;
        this.setInGameTime("interval.day");
        break;
      case IntervalUnitId.Ticks:
        alertInterval = `${interval.amount * Environment.tickMultiplier} ticks"`;
        this.setInGameTime("interval.tick");
        break;

      case IntervalUnitId.Seconds:
        alertInterval = `${interval.amount} seconds`;
        this.setRealTime(interval.amount * 1000);
        break;
      case IntervalUnitId.Minutes:
        alertInterval = `${interval.amount} minutes`;
        this.setRealTime(interval.amount * 1000 * 60);
        break;
      case IntervalUnitId.Hours:
        alertInterval = `${interval.amount} hours`;
        this.setRealTime(interval.amount * 1000 * 60 * 60);
        break;
      default: // Unknown
        break;
    }

    this.sleeps = interval.amount;
    Log.debug(`Screenshotter enabled to every ${alertInterval}`);
  }

  public disable(): void {
    Storage.setIsEnabled(false);

    if (this.inGameSubscription) {
      this.inGameSubscription.dispose();
    }

    context.clearInterval(this.realTimeSubscription);
    Log.debug("Screenshotter disabled");
  }

  public setInGameTime(type: HookType): void {
    if (this.inGameSubscription) this.inGameSubscription.dispose();
    this.inGameSubscription = context.subscribe(type, () => this.inGameTimeCapture());
  }

  public setRealTime(milliseconds: number): void {
    context.clearInterval(this.realTimeSubscription);
    this.realTimeSubscription = context.setInterval(() => Capturer.capture(), milliseconds);
  }

  private inGameTimeCapture(): void {
    switch (Storage.getInterval().unit.id) {
      case IntervalUnitId.Days:
      case IntervalUnitId.Ticks:
        this.sleeps -= 1;
        break;
      case IntervalUnitId.Months:
        if (date.day === 1) {
          this.sleeps -= 1;
        }
        break;
      case IntervalUnitId.Years:
        if (date.day === 1 && date.month === 0) {
          this.sleeps -= 1;
        }
        break;
      default:
        break;
    }

    if (this.sleeps <= 0) {
      Capturer.capture();
      this.resetSleepTimer();
    }
  }

  private resetSleepTimer(): void {
    const interval = Storage.getInterval();
    this.sleeps = interval.unit.id === IntervalUnitId.Ticks
      ? interval.amount * Environment.tickMultiplier
      : interval.amount;
  }
}
