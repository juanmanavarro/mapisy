export class ConversationHelper {
  static async toNested(conversation) {
    if (!conversation.id) {
      throw new Error("Nested conversation doesnt have id");
    }

    const steps = await conversation.steps();
    const nestedSteps = {};

    for (const key in steps) {
      nestedSteps[`${conversation.id}.${key}`] = steps[key];
    }

    return nestedSteps;
  }
}
