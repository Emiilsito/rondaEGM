import { supabase } from "@/lib/supabase";

export type ChatMessage = {
  id: string;
  groupId: string;
  playerId: string;
  playerName: string;
  text: string;
  createdAt: string;
};

export async function fetchGroupMessages(groupId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("group_id", groupId)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) throw new Error(`Error cargando mensajes: ${error.message}`);
  return (data ?? []).map((m) => ({
    id: m.id,
    groupId: m.group_id,
    playerId: m.player_id,
    playerName: m.player_name,
    text: m.text,
    createdAt: m.created_at,
  }));
}

export async function sendMessage(
  groupId: string,
  playerId: string,
  playerName: string,
  text: string,
): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      group_id: groupId,
      player_id: playerId,
      player_name: playerName,
      text: text.trim().slice(0, 200),
    })
    .select()
    .single();

  if (error) throw new Error(`Error enviando mensaje: ${error.message}`);
  return {
    id: data.id,
    groupId: data.group_id,
    playerId: data.player_id,
    playerName: data.player_name,
    text: data.text,
    createdAt: data.created_at,
  };
}

export function subscribeToMessages(
  groupId: string,
  onMessage: (message: ChatMessage) => void,
) {
  const channelName = `chat:${groupId}`;
  const existingChannel = supabase.channel(channelName);

  if (existingChannel) {
    supabase.removeChannel(existingChannel);
  }

  const channel = supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `group_id=eq.${groupId}` },
      (payload) => {
        const m = payload.new as {
          id: string;
          group_id: string;
          player_id: string;
          player_name: string;
          text: string;
          created_at: string;
        };
        onMessage({
          id: m.id,
          groupId: m.group_id,
          playerId: m.player_id,
          playerName: m.player_name,
          text: m.text,
          createdAt: m.created_at,
        });
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
