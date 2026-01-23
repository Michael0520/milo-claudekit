export enum HookEventName {
  Stop = "Stop",
  PreToolUse = "PreToolUse",
  PostToolUse = "PostToolUse",
  SessionStart = "SessionStart",
}

type SharedInput = {
  hookEventName: HookEventName;
};

export type StopInput = SharedInput & {
  hookEventName: HookEventName.Stop;
  stopHookActive: boolean;
};

export type PreToolUseInput = SharedInput & {
  hookEventName: HookEventName.PreToolUse;
  toolName: string;
  toolInput: {
    [key: string]: any;
  };
};

export type PostToolUseInput = SharedInput & {
  hookEventName: HookEventName.PostToolUse;
  toolName: string;
  toolInput: {
    [key: string]: any;
  };
  toolResponse: {
    [key: string]: any;
  };
};

export type SessionStartInput = SharedInput & {
  hookEventName: HookEventName.SessionStart;
};

export type HookInput = StopInput | PreToolUseInput | PostToolUseInput | SessionStartInput;
