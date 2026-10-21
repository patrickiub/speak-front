"use client";

import { useEffect } from "react";
import Script from "next/script";

// Docs: https://vlibras.gov.br/doc/widget/installation/webpageintegration.html
const VLIBRAS_SRC = "https://vlibras.gov.br/app/vlibras-plugin.js";

/**
 * Lado do botão flutuante (o VLibras o centraliza na vertical, a 10px da borda).
 * "L" atrapalha menos nos dois layouts:
 * - desktop: o chat fica à direita; à esquerda o botão cai sobre a borda do
 *   vídeo da câmera, que só tem overlays nos cantos de cima;
 * - mobile: os botões da câmera (captura/desligar) ficam no canto inferior
 *   direito da câmera, quase no meio da tela — exatamente onde "R" cairia.
 */
const VLIBRAS_POSITION: VLibrasPosition = "L";
const VLIBRAS_AVATAR: VLibrasAvatar = "icaro";

// Elementos que o VLibras injeta direto no <body>:
// - botão de acesso (shadow root), criado pelo vlibras-plugin.js;
// - app do avatar (shadow root), criado só quando o usuário abre o widget.
const INJECTED_IDS = ["vlibras-access-wrapper", "vlibras-app-root"] as const;

type VLibrasPosition = "L" | "R";
type VLibrasAvatar = "icaro" | "hosana" | "guga" | "random";

declare global {
  interface Window {
    VLibras?: {
      Widget: new (
        config?: {
          rootPath?: string;
          personalization?: string;
          avatar?: VLibrasAvatar;
          position?: VLibrasPosition;
        }
      ) => unknown;
    };
    VLibrasWidget?: {
      path?: string;
      avatar?: VLibrasAvatar;
      position?: VLibrasPosition;
      initBtn?: HTMLButtonElement;
      open?: () => void;
    };
  }
}

// Nós removidos do DOM ao sair da rota, para reanexar ao voltar.
let parkedNodes: HTMLElement[] = [];
let isMounted = false;

/**
 * O VLibras não tem API de destruição: o plugin guarda numa closure que já
 * inicializou e o app do avatar é um módulo ES que só executa uma vez por
 * página. Então, em vez de destruir, tiramos os nós do DOM ao sair e os
 * reanexamos ao voltar (shadow roots e listeners continuam válidos).
 *
 * O que NÃO dá para remover (inofensivo fora da /sala-v2):
 * - as tags <script> do plugin/app e os globais window.VLibras/VLibrasWidget;
 * - os <style> que o app adiciona no <head> (só afetam classes .vlibras-*).
 */
function parkInjectedNodes() {
  const appRoot = document.getElementById("vlibras-app-root");
  // Fecha o avatar se estiver aberto (o app observa este atributo).
  if (appRoot?.dataset.active === "true") appRoot.dataset.active = "false";

  for (const id of INJECTED_IDS) {
    const node = document.getElementById(id);
    if (node) {
      node.remove();
      parkedNodes.push(node);
    }
  }
}

function restoreParkedNodes() {
  for (const node of parkedNodes) document.body.appendChild(node);
  parkedNodes = [];
}

function initVLibras() {
  // Já inicializado (o plugin expõe o botão em VLibrasWidget.initBtn).
  if (!window.VLibras || window.VLibrasWidget?.initBtn) return;

  // O plugin se autoinicializa ~50ms após executar, inclusive em navegação
  // client-side (não depende do evento load). Chamar o construtor aqui, antes
  // disso, aplica a configuração e inicializa uma única vez — a autoinit
  // posterior vira no-op.
  new window.VLibras.Widget({
    position: VLIBRAS_POSITION,
    avatar: VLIBRAS_AVATAR,
  });

  // Se o usuário saiu da rota antes de o script terminar de carregar.
  if (!isMounted) parkInjectedNodes();
}

/** Widget VLibras (tradução para Libras). Usar só na /sala-v2. */
export function VLibrasWidget() {
  useEffect(() => {
    isMounted = true;
    restoreParkedNodes();
    return () => {
      isMounted = false;
      parkInjectedNodes();
    };
  }, []);

  return <Script src={VLIBRAS_SRC} strategy="afterInteractive" onLoad={initVLibras} />;
}
