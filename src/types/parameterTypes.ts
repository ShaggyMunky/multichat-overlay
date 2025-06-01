export type ParamType = "bool" | "int" | "string";

export type ParamTypeMap = {
  bool: boolean;
  int: number | null;
  string: string;
};

export type ParamValues<
  T extends Record<string, { type: ParamType; default: any }>
> = {
  [K in keyof T]: T[K]["type"] extends keyof ParamTypeMap
    ? ParamTypeMap[T[K]["type"]]
    : never;
};
