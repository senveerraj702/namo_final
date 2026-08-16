import { getWhatsAppDestinationNumber, env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { WhatsAppStatus } from '../../types/enquiry.types.js';

export interface WhatsAppSendResult {
  status: WhatsAppStatus;
  messageId?: string;
  errorDetails?: string;
}

export class WhatsAppService {
  /**
   * Stub implementation for future Meta Cloud API integration.
   */
  public static async sendNotification(messageText: string): Promise<WhatsAppSendResult> {
    const destinationNumber = getWhatsAppDestinationNumber();

    if (!destinationNumber) {
      logger.warn('⚠️ WhatsApp destination number is not configured.');
      return { status: 'not_configured', errorDetails: 'WhatsApp destination number missing' };
    }

    if (!env.WHATSAPP_ACCESS_TOKEN || !env.WHATSAPP_PHONE_NUMBER_ID) {
      logger.warn('⚠️ WhatsApp Cloud API is not fully configured (missing tokens). Simulation mode: Logging message instead of sending.');
      logger.info('======================================================');
      logger.info(` simulated message to ${destinationNumber}:`);
      logger.info(messageText);
      logger.info('======================================================');
      return { status: 'sent', messageId: `sim_${Date.now()}` };
    }

    // TODO: Implement actual Meta Cloud API request here
    // Example:
    // const response = await fetch(`https://graph.facebook.com/${env.WHATSAPP_API_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     messaging_product: 'whatsapp',
    //     to: destinationNumber,
    //     type: 'text',
    //     text: { body: messageText },
    //   }),
    // });
    
    logger.info(`Sending WhatsApp enquiry to ${destinationNumber} via Meta API (Not Yet Implemented)...`);

    try {
      // Mocked response
      const messageId = `msg_${Date.now()}`;
      logger.info(`🟢 WhatsApp message sent. ID: ${messageId}`);
      return { status: 'sent', messageId };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown WhatsApp error';
      logger.error('❌ Failed to send WhatsApp message:', error);
      return { status: 'failed', errorDetails: errorMessage };
    }
  }
}
