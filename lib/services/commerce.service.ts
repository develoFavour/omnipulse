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
	subaccount_code?: string;
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
	customer_email?: string;
	campaign_id?: string;
}

export interface SettlementAccount {
	id: string;
	tenant_id: string;
	business_name: string;
	settlement_bank: string;
	bank_name: string;
	account_number: string;
	account_name: string;
	subaccount_code: string;
	percentage_charge: number;
	currency: string;
	is_verified: boolean;
	created_at: string;
	updated_at: string;
}

export interface BankInfo {
	name: string;
	code: string;
	active: boolean;
}

export interface SaveSettlementPayload {
	business_name: string;
	settlement_bank: string; // bank code
	bank_name: string;
	account_number: string;
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

	async getSettlementAccount(): Promise<SettlementAccount | null> {
		try {
			const response = await apiClient.get<{ settlement_account: SettlementAccount | null }>(
				ENDPOINTS.COMMERCE.SETTLEMENT,
			);
			return response.data?.settlement_account || null;
		} catch {
			return null;
		}
	}

	async saveSettlementAccount(payload: SaveSettlementPayload): Promise<SettlementAccount> {
		const response = await apiClient.post<{ settlement_account: SettlementAccount }>(
			ENDPOINTS.COMMERCE.SETTLEMENT,
			payload,
		);
		return response.data.settlement_account;
	}

	async listBanks(country = "nigeria"): Promise<BankInfo[]> {
		try {
			const response = await apiClient.get<{ banks: BankInfo[] }>(
				`${ENDPOINTS.COMMERCE.BANKS}?country=${country}`,
			);
			return response.data?.banks || [];
		} catch {
			return [];
		}
	}

	async resolveAccount(
		accountNumber: string,
		bankCode: string,
	): Promise<{ account_number: string; account_name: string }> {
		const response = await apiClient.get<{ account_number: string; account_name: string }>(
			`${ENDPOINTS.COMMERCE.RESOLVE_ACCOUNT}?account_number=${encodeURIComponent(accountNumber)}&bank_code=${encodeURIComponent(bankCode)}`,
		);
		return response.data;
	}
}

export const commerceService = new CommerceService();
