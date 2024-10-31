import * as exchangeRates from 'ecb-euro-exchange-rates';
import BigNumber from "bignumber.js";

export class OpenAICost {
  private static PRICES = {
    'gpt-4o-2024-05-13': {
      input: 5,
      output: 15,
    },
    'gpt-4o': {
      input: 5,
      output: 15,
    },
    'gpt-3.5-turbo-0125': {
      input: 0.5,
      output: 1.5,
    },
  };

  static async calculate({ usage, model }) {
    if ( !OpenAICost.PRICES[model] ) {
      throw new Error("No model prices");
    }

    const result = await exchangeRates.fetch();

    const input = new BigNumber(usage.prompt_tokens).multipliedBy(OpenAICost.PRICES[model].input).dividedBy(1000000).dividedBy(result.rates.USD).toNumber();
    const output = new BigNumber(usage.completion_tokens).multipliedBy(OpenAICost.PRICES[model].output).dividedBy(1000000).dividedBy(result.rates.USD).toNumber();

    return {
      input,
      output,
      total: new BigNumber(input).plus(output).toPrecision(8),
    }
  }
}
