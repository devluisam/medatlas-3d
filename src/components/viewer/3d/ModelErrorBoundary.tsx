"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catches errors from loading a 3D model (e.g. file not found, parse error)
 * and renders a fallback instead. Used to gracefully degrade to the
 * procedural placeholder when no real GLB model is present.
 */
export class ModelErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // Silent — the fallback (procedural body) is the expected state
    // until the user adds a real model file.
    if (process.env.NODE_ENV === "development") {
      console.info(
        "[MEDATLAS] Modelo 3D realista não encontrado — usando boneco procedural. " +
          "Adicione public/models/skeleton.glb para ativar o modelo real."
      );
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
