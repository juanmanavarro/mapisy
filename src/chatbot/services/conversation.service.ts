import { Send } from 'src/chatbot/helpers/send';
import { createState } from '@persevie/statemanjs';
import { Context } from '../conversations/context';
import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ConversationService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {} // Inyectar la caché

  async execute(user, message, conversation) {
    const userCache: any = await this.cache.get(user.id);
    if ( userCache?.get().conversation !== conversation.constructor.name ) {
      Context.reset(user);
      this.cache.del(user.id);
    }

    const userCachedState: any = await this.cache.get(user.id) || createState({
      conversation: conversation.constructor.name,
      steps: await conversation.steps(),
      currentStep: conversation.firstStep || 0,
      firstExecution: true,
    });

    const userState = userCachedState.get();

    const step = userState.steps[userState.currentStep];
    if ( !step ) {
      console.log('step not exists', userState.currentStep);
      await this.cache.del(user.id);
      return;
    }

    if (userState.firstExecution) {
      userCachedState.update((state) => {
        state.firstExecution = false;
      });
      await this.cache.set(user.id, userCachedState);

      if ( step.message ) {
        const m = await step.message({ user, message });
        Send.to(user, m);
      } else this.execute(user, message, conversation);

      return;
    }

    if (typeof step.action === 'function') {
      const nextStepIndex = await step.action({ user, message });

      if ( nextStepIndex !== false ) {
        userCachedState.update((state) => {
          state.currentStep = nextStepIndex;
        });
      }

      const nextStep = userState.steps[userState.currentStep];
      if ( nextStep && typeof nextStep.message === 'function' && nextStepIndex !== false ) {
        const m = await nextStep.message({ user, message });
        if (m) Send.to(user, m);
      }

      if ( !nextStep.message ) {
        const nextStepIndex = await step.action({ user, message });

        if ( nextStepIndex !== false ) {
          userCachedState.update((state) => {
            state.currentStep = nextStepIndex;
          });
        }

        this.execute(user, message, conversation);
      }
    } else {
      await this.cache.del(user.id);
      this.execute(user, message, conversation);
    }
  }
}
