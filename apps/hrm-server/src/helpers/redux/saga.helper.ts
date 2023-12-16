import { Store } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { spawn } from 'redux-saga/effects';
import { ApplicationLogger, getError, LoggerFactory } from '@lb/infra';

import { configureStore } from '@reduxjs/toolkit';
import { IDispatchAction } from '@mt-hrm/common/types';

import common from './common.slice';

import notificationSaga from './sagas/notification.saga';

function* rootSaga() {
  yield spawn(notificationSaga);
}

export class SagaHelper {
  private static instance: SagaHelper;

  private logger: ApplicationLogger;
  private store: Store;

  constructor() {
    this.logger = LoggerFactory.getLogger([SagaHelper.name]);
    this.configure();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new SagaHelper();
    }

    return this.instance;
  }

  configure() {
    this.logger.info('[configure] Configure application saga');

    const sagaMiddleware = createSagaMiddleware();
    this.store = configureStore({
      reducer: { common },
      middleware: [sagaMiddleware],
    });
    sagaMiddleware.run(rootSaga);
    this.logger.info(
      '[configure] Store is now configured! Saga is now running!',
    );
  }

  dispatch<T>(action: IDispatchAction<T>) {
    if (!this.store) {
      throw getError({
        message: 'Invalid store state! Store is now undefined!',
        statusCode: 500,
      });
    }

    const { type, payload = {}, log = false } = action;
    if (log) {
      this.logger.info('[dispatch] Type: %s | Payload: %j', type, payload);
    }

    this.store.dispatch({ type, payload });
  }

  batchDispatch(actions: Array<IDispatchAction<any>>) {
    if (!this.store) {
      throw getError({
        message: 'Invalid store state! Store is now undefined!',
        statusCode: 500,
      });
    }

    actions?.forEach(action => {
      this.dispatch(action);
    });
  }
}
