import { Controller, Post, Body, HttpStatus, Get, Response, Request } from "@nestjs/common";
import { WhatsAppChannel } from "src/chatbot/channels/whatsapp.channel";
import { ChatbotService } from "src/chatbot/chatbot.service";
import { BaseConversation } from "./conversations/base.conversation";
import { TelegramChannel } from "src/chatbot/channels/telegram.channel";
import { GotaGotaConversation } from "./conversations/gota-gota/gota-gota.conversation";
import { MotorentalConversation } from "./conversations/motorental/motorental.conversation";
import { PurchaseAssistantConversation } from "./conversations/purchase-assistant/purchase-assistant.conversation";
import { AlertConversation } from "./conversations/alert/alert.conversation";

@Controller('whatsapp/webhook')
export class AssistantInput {
  private whatsapp: WhatsAppChannel;

  usersStateCache = new Map();

  constructor(
    private readonly chatbotService: ChatbotService,
    private readonly baseConversation: BaseConversation,
    protected readonly gotaGotaConversation: GotaGotaConversation,
    protected readonly motorentalConversation: MotorentalConversation,
    protected readonly purchaseAssistantConversation: PurchaseAssistantConversation,
    protected readonly alertConversation: AlertConversation,
  ) {
    if ( process.env.WHATSAPP_ACCOUNT_TOKEN ) {
      this.whatsapp = new WhatsAppChannel({
        phone_id: process.env.WHATSAPP_PHONE_ID,
        account_id: process.env.WHATSAPP_ACCOUNT_ID,
        account_token: process.env.WHATSAPP_ACCOUNT_TOKEN,
        verify_token: process.env.WHATSAPP_VERIFY_TOKEN,
      });

      this.whatsapp.output();
    }

    if ( process.env.TELEGRAM_BOT_TOKEN ) {
      new TelegramChannel({
        token: process.env.TELEGRAM_BOT_TOKEN,
      }).listen((message) => this.listenTo(message));
    }
  }

  @Post()
  async webhook(@Body() body, @Response() res) {
    this.whatsapp.input(body, async (message) => this.listenTo(message));

    return res.sendStatus(HttpStatus.OK);
  }

  listenTo(message) {
    let conversation = null;

    if ( message.url ) {
      this.usersStateCache.set(message.from, this.purchaseAssistantConversation);
    }

    if ( message.text?.startsWith('/start') ) {
      const demo = message.text.replace('/start', '').trim();
      if ( demo === 'order' ) conversation = this.gotaGotaConversation;
      if ( demo === 'rent' ) conversation = this.motorentalConversation;
      if ( demo === 'purchase' ) conversation = this.purchaseAssistantConversation;
      if ( demo === 'alert' ) conversation = this.alertConversation;
      if ( !demo ) conversation = this.baseConversation;
      this.usersStateCache.set(message.from, conversation);
    }

    if ( message.interaction === 'order' ) this.usersStateCache.set(message.from, this.gotaGotaConversation);
    if ( message.interaction === 'rent' ) this.usersStateCache.set(message.from, this.motorentalConversation);

    this.chatbotService.listen(message, this.alertConversation);
    // this.chatbotService.listen(message, this.usersStateCache.get(message.from) || this.baseConversation);
  }

  @Get()
  async verify(@Request() req, @Response() res) {
    const challenge = this.whatsapp.verify(req)
    return challenge
      ? res.status(200).send(challenge)
      : res.sendStatus(403);
  }
}
