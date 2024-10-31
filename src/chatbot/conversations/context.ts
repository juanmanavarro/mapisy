export class Context {
  private static context = {};

  static reset(user) {
    delete this.context[user._id.toString()];
  }

  static set(user, path: string, value) {
    if (!this.context[user._id.toString()]) {
      this.context[user._id.toString()] = {};
    }

    const keys = path.split('.');
    let current = this.context[user._id.toString()];
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }

    const finalKey = keys[keys.length - 1];
    if (Array.isArray(value)) {
      if (!Array.isArray(current[finalKey])) {
        current[finalKey] = [];
      }
      current[finalKey] = current[finalKey].concat(value);
    } else {
      current[finalKey] = value;
    }

    console.log('Context', JSON.stringify(this.context, null, 2));
  };

  static get(user, path = '') {
    const keys = path.split('.').filter(Boolean);
    let current = this.context[user._id.toString()];
    for (const key of keys) {
        if (current && key in current) {
            current = current[key];
        } else {
            return undefined;
        }
    }
    return current;
  };

  static delete(user, path: string, id: any = null) {
    if (!this.context[user._id.toString()]) return;

    const keys = path.split('.');
    let current = this.context[user._id.toString()];
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        return;
      }
      current = current[key];
    }

    const finalKey = keys[keys.length - 1];
    if (Array.isArray(current[finalKey])) {
      if (id !== null) {
        current[finalKey] = current[finalKey].filter((item: any) => item.id !== id);
      } else {
        delete current[finalKey];
      }
    } else {
      delete current[finalKey];
    }
  }

  static debug() {
    console.log('Context', JSON.stringify(this.context, null, 2));
  }
}
