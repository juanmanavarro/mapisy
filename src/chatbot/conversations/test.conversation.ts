import { Injectable } from '@nestjs/common';
import { NewConversation } from './conversation';

@Injectable()
export class TestConversation extends NewConversation {
  steps() {
    return {
      id: TestConversation.name,
      0: {
        message: async () => {
          return 'Step 0';
        },
        action: () => {
          console.log('Action 0');

          return 1;
        }
      },
      1: {
        message: async () => {
          return 'Step 1';
        },
        action: ({ message }) => {
          console.log('Action 1');

          return false;
        }
      },
      2: {
        message: async () => {
          return 'Step 2';
        },
      },
      3: {
        message: async () => {
          return 'Step 3';
        },
      },
    }
  }
}
