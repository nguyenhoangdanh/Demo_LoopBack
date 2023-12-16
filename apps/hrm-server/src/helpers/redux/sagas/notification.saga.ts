import {
  IDispatchAction,
  IObserveNotificationPayload,
  IOrderMessageArgs,
} from '@mt-hrm/common/types';
import { fork, takeEvery } from 'redux-saga/effects';

import { applicationContext } from '@mt-hrm/configurations';
import { NotificationActions } from '@mt-hrm/helpers/redux/actions';
import {
  BaseApplication,
  LoggerFactory,
  SocketIOKeys,
  SocketIOServerHelper,
  applicationLogger,
} from '@lb/infra';
import { BindingKeys, NotificationTypes } from '@mt-hrm/common';

const logger = LoggerFactory.getLogger(['DashboardSaga']);

const SocketObservationTopics = {
  MESSAGE: 'observation-message',
};

// -------------------------------------------------------------------------
function* observeMessage(args: IOrderMessageArgs) {
  const { action, payload, error } = args;
  try {
    const application = applicationContext.getSync<BaseApplication>(
      BindingKeys.APPLICATION_INSTANCE,
    );
    const socketIOInstance = application.getSync<SocketIOServerHelper>(
      SocketIOKeys.SOCKET_IO_INSTANCE,
    );

    socketIOInstance.send({
      destination: `${NotificationTypes.MESSAGE}`,
      payload: {
        topic: SocketObservationTopics.MESSAGE,
        data: { action, payload, error },
      },
    });
    applicationLogger.info(
      '[observeMessage] Information: %s | %s | %s',
      action,
      payload,
      error,
    );
  } catch (error) {
    applicationLogger.error(
      '[observeMessage] Error while order! Error: %s',
      error,
    );
  }
}

// -------------------------------------------------------------------------
function* handleObserveNotification() {
  yield takeEvery(
    NotificationActions.OBSERVE_NOTIFICATION,
    function* handler(action: IDispatchAction<IObserveNotificationPayload>) {
      try {
        const { payload } = action;
        if (!payload) {
          logger.error(
            '[handleObserveNotification] Invalid payload to observe notification!',
          );
          return;
        }

        const { type, args } = payload;
        if (!NotificationTypes.isValid(type)) {
          logger.error(
            '[handleObserveNotification] Invalid type to process observe notification! Type: %s',
            type,
          );
          return;
        }

        switch (type) {
          case NotificationTypes.MESSAGE: {
            yield observeMessage(args as unknown as IOrderMessageArgs);
            break;
          }
          default: {
            break;
          }
        }
      } catch (error) {
        applicationLogger.error('[handleObserveNotification] Error: %s', error);
      }
    },
  );
}

export default function* saga() {
  yield fork(handleObserveNotification);
}
