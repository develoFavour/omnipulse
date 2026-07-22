import { StateCreator } from "zustand";
import { channelService, ChannelPayload, ChannelResponse } from "@/lib/services/channel.service";

export interface ChannelState {
  channels: ChannelResponse[];
  isLoadingChannels: boolean;
  isConnectingChannel: boolean;
  channelError: string | null;
  fetchChannels: () => Promise<ChannelResponse[]>;
  connectChannel: (payload: ChannelPayload) => Promise<ChannelResponse>;
}

export const createChannelSlice: StateCreator<ChannelState> = (set) => ({
  channels: [],
  isLoadingChannels: false,
  isConnectingChannel: false,
  channelError: null,

  fetchChannels: async () => {
    set({ isLoadingChannels: true, channelError: null });
    try {
      const data = await channelService.getChannels();
      set({ channels: data, isLoadingChannels: false });
      return data;
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
        channels: [...state.channels, data], 
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
