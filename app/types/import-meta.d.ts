interface ImportMeta {
  readonly env?: {
    readonly DEV?: boolean;
    readonly PROD?: boolean;
    readonly SSR?: boolean;
    readonly [key: string]: unknown;
  };
}
