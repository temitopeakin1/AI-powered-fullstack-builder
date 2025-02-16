export class LastInputOnTerminal {
  private static lastInput: string = "";

  static getLastInput(): string {
    return LastInputOnTerminal.lastInput;
  }

  static setLastInput(data: string): void {
    LastInputOnTerminal.lastInput = data;
  }

  static isCtrlCCommand(): boolean {
    return LastInputOnTerminal.lastInput === '\x03';
  }
}
