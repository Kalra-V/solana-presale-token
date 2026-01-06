export interface DepositEvent {
  user_pubkey: string;
  lamports: number;
  central_pda: string;
}

export interface InitializeUserEvent {
  user_pubkey: string;
  user_state_pda: string;
}

export interface EnableDistributionEvent {
  central_pda: string;
  signer: string;
}

export interface DistributeEvent {
  user_pubkey: string;
  user_state_pda: string;
  token_amount: number;
  mint: string;
  signer: string;
}

export interface EventItem {
  PK: string;
  SK: string;
  eventType: string;
  txSignature: string;
  slot: number;
  timestamp: string;
  [key: string]: any;
}

export interface UserStats {
  totalSolDeposited: number;
  estimatedTokens: number;
  isDistributed: boolean;
  deposits: Array<{
    txSignature: string;
    amount: number;
    timestamp: string;
  }>;
}

export interface PresaleStats {
  totalSolRaised: number;
  participantCount: number;
  isDistributable: boolean;
}

export interface Activity {
  eventType: string;
  txSignature: string;
  timestamp: string;
  user_pubkey?: string;
  lamports?: number;
  token_amount?: number;
}

