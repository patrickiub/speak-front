"use client";

import { useCallback, useSyncExternalStore } from "react";

// Safari antigo só expõe a API com prefixo webkit.
type FullscreenDocument = Document & {
  webkitFullscreenEnabled?: boolean;
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};
type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};
// `lock`/`unlock` saíram dos tipos do lib.dom, mas existem no Chrome Android.
type LockableOrientation = ScreenOrientation & {
  lock?: (orientation: string) => Promise<void>;
  unlock?: () => void;
};

function subscribe(onChange: () => void) {
  document.addEventListener("fullscreenchange", onChange);
  document.addEventListener("webkitfullscreenchange", onChange);
  return () => {
    document.removeEventListener("fullscreenchange", onChange);
    document.removeEventListener("webkitfullscreenchange", onChange);
  };
}

function getIsFullscreen() {
  const doc = document as FullscreenDocument;
  return Boolean(doc.fullscreenElement ?? doc.webkitFullscreenElement);
}

function getIsSupported() {
  const doc = document as FullscreenDocument;
  return Boolean(doc.fullscreenEnabled || doc.webkitFullscreenEnabled);
}

const noopSubscribe = () => () => {};

function getOrientation(): LockableOrientation | undefined {
  return (screen as Screen & { orientation?: LockableOrientation }).orientation;
}

/**
 * Tela cheia da página inteira (estilo player de vídeo). Ao entrar, tenta
 * travar em retrato (Android). iPhone não suporta tela cheia para páginas:
 * `isSupported` fica falso e o botão não deve aparecer.
 */
export function useFullscreen() {
  const isFullscreen = useSyncExternalStore(subscribe, getIsFullscreen, () => false);
  const isSupported = useSyncExternalStore(noopSubscribe, getIsSupported, () => false);

  const enter = useCallback(async () => {
    const root = document.documentElement as FullscreenElement;
    try {
      if (root.requestFullscreen) {
        await root.requestFullscreen({ navigationUI: "hide" });
      } else {
        await root.webkitRequestFullscreen?.();
      }
    } catch {
      return;
    }
    try {
      await getOrientation()?.lock?.("portrait");
    } catch {
      // Sem suporte a travar orientação: ignora.
    }
  }, []);

  const exit = useCallback(async () => {
    try {
      getOrientation()?.unlock?.();
    } catch {
      // ignora
    }
    const doc = document as FullscreenDocument;
    try {
      if (doc.exitFullscreen) {
        await doc.exitFullscreen();
      } else {
        await doc.webkitExitFullscreen?.();
      }
    } catch {
      // Já saiu (ex.: botão voltar).
    }
  }, []);

  const toggle = useCallback(() => {
    if (getIsFullscreen()) {
      void exit();
    } else {
      void enter();
    }
  }, [enter, exit]);

  return { isSupported, isFullscreen, toggle };
}
