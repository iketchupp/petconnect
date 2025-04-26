'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useMessageStore } from '@/stores/message-store';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { session } = useAuthStore();
  const { connect, disconnect } = useMessageStore();
  const hasSetupRef = useRef(false);
  const prevConnectionStateRef = useRef({ connected: false, connecting: false });

  // Setup WebSocket connection and store integrations once
  useEffect(() => {
    if (hasSetupRef.current) return;
    hasSetupRef.current = true;

    // Set up refreshConversations to use React Query
    const originalRefreshConversations = useMessageStore.getState().refreshConversations;
    useMessageStore.setState({
      refreshConversations: () => {
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      },
    });

    // Set up connection status listener
    const unsubscribeConnection = useMessageStore.subscribe((state) => {
      // Store previous values for comparison to avoid unnecessary notifications
      const prevState = prevConnectionStateRef.current;
      const newState = { connected: state.connected, connecting: state.connecting };

      // Only react to actual state changes
      if (prevState.connected === newState.connected && prevState.connecting === newState.connecting) {
        return;
      }

      // Update ref for next comparison
      prevConnectionStateRef.current = newState;
    });

    return () => {
      // Clean up on unmount
      unsubscribeConnection();
      useMessageStore.setState({ refreshConversations: originalRefreshConversations });
      disconnect();
    };
  }, [queryClient, disconnect]);

  // Handle authentication changes
  useEffect(() => {
    const connectToWebSocket = async () => {
      if (!session?.token) return;

      try {
        const state = useMessageStore.getState();
        if (!state.connected && !state.connecting) {
          await connect(session.token);
        }
      } catch (error) {
        console.error('WebSocket connection error:', error);
        toast.error('Could not connect to the messaging service. Please try again later.');
      }
    };

    connectToWebSocket();
  }, [session, connect]);

  return children;
}
