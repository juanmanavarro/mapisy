export class ConfirmButtons {
  static create(state = undefined) {
    const confirmPayload = state ? { state } : { confirm: true };

    return [
      {
        text: 'Si',
        data: JSON.stringify(confirmPayload),
      },
      {
        text: 'No',
        data: JSON.stringify({ confirm: false }),
      }
    ];
  }
}
