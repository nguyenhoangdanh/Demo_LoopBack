export interface IMessage {
  code: string;
  message: string;
}

export interface IDispatchAction<E> {
  type: string;
  payload?: E;
  log?: boolean;
}

export interface IMessageArgs {
  message: string;
}

export interface IObserveNotificationPayload {
  type: 'message';
  args: IMessageArgs;
}

export interface IOrderMessageArgs {
  action: string;
  payload: IMessageArgs;
  error: any;
}

export interface ITotalData<T> {
  total: number;
  data: T[];
}
