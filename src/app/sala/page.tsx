import { RoomPageV2 } from "@/components/room-v2/room-page-v2";

// Sala principal (v2): câmera + avatar VLibras + conversa.
// A versão antiga, sem avatar, fica em /sala-v1 como fallback.
export default function SalaPage() {
  return <RoomPageV2 />;
}
