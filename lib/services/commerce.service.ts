import { apiClient } from "@/lib/api/axios-instance";
import { ENDPOINTS } from "@/lib/constants/endpoint.const";

export interface PaymentTransaction {
	id: string;
	tenant_id: string;
	conversation_id?: string;
	contact_id: string;
	campaign_id?: string;
	amount: number; // in kobo
	currency: string;
	description: string;
	reference: string;
	paystack_url: string;
	status: "pending" | "paid" | "failed" | "expired";
	paid_at?: string;
	created_at: string;
	updated_at: string;
	contact_name?: string;
	contact_phone?: string;
}

export interface CreatePaymentLinkPayload {
	amount: number; // in kobo
	description: string;
	campaign_id?: string;
}

class CommerceService {
	async createPaymentLink(
		conversationId: string,
		payload: CreatePaymentLinkPayload,
	): Promise<PaymentTransaction> {
		const response = await apiClient.post<PaymentTransaction>(
			ENDPOINTS.COMMERCE.PAYMENT_LINK(conversationId),
			payload,
		);
		return response.data;
	}

	async listConversationPaymentLinks(
		conversationId: string,
	): Promise<PaymentTransaction[]> {
		const response = await apiClient.get<{ payment_links: PaymentTransaction[] }>(
			ENDPOINTS.COMMERCE.CONVERSATION_LINKS(conversationId),
		);
		return response.data?.payment_links || [];
	}

	async listContactPaymentLinks(
		contactId: string,
	): Promise<PaymentTransaction[]> {
		const response = await apiClient.get<{ payment_links: PaymentTransaction[] }>(
			ENDPOINTS.COMMERCE.CONTACT_LINKS(contactId),
		);
		return response.data?.payment_links || [];
	}
}

export const commerceService = new CommerceService();

