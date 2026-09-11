import { StateCreator } from "zustand";
import { channelService, ChannelPayload, ChannelResponse } from "@/lib/services/channel.service";

export interface ChannelState {
  channels: ChannelResponse[];
  isLoadingChannels: boolean;
  isConnectingChannel: boolean;
  channelError: string | null;
  fetchChannels: () => Promise<ChannelResponse[]>;
  connectChannel: (payload: ChannelPayload) => Promise<ChannelResponse>;
  setChannels: (channels: ChannelResponse[]) => void;
}

export const createChannelSlice: StateCreator<ChannelState> = (set) => ({
  channels: [],
  isLoadingChannels: false,
  isConnectingChannel: false,
  channelError: null,

  setChannels: (channels: ChannelResponse[]) => set({ channels: Array.isArray(channels) ? channels : [] }),

  fetchChannels: async () => {
    set({ isLoadingChannels: true, channelError: null });
    try {
      const data = await channelService.getChannels();
      const safeData = Array.isArray(data) ? data : [];
      set({ channels: safeData, isLoadingChannels: false });
      return safeData;
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Failed to fetch channels";
      set({ channelError: msg, isLoadingChannels: false });
      throw err;
    }
  },

  connectChannel: async (payload: ChannelPayload) => {
    set({ isConnectingChannel: true, channelError: null });
    try {
      const data = await channelService.createChannel(payload);
      set((state) => ({ 
        channels: [...state.channels.filter((c) => c.platform_name !== data.platform_name), data], 
        isConnectingChannel: false 
      }));
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Failed to connect channel";
      set({ channelError: msg, isConnectingChannel: false });
      throw err;
    }
  },
});
