export type UserCreate = {
  name: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
};

export type AuthResponse = {
  token: string;
  user?: any;
  hasConfirmed?: boolean;
};

export type ContributionCreate = {
  amount: number;
  isAnonymous?: boolean;
  isRepayable?: boolean;
  note?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
};
