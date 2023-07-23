// Implementation based on https://rclayton.silvrback.com/custom-errors-in-node-js

class NekolyticsError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name; // (name of this error is the same as the class name)
    Error.captureStackTrace(this, this.constructor); // (better stacktrace)
  }
}

class FriendlyError extends NekolyticsError {
  constructor(message = 'There is an issue with the settings.', settings = null) {
    super(message);
    this.settings = settings;
  }
}

class ConnectivityError extends NekolyticsError {
  constructor(message = 'Connectivity issue.') {
    super(message);
  }
}

class ServiceDisconnectedError extends NekolyticsError {
  constructor(message = 'Service disconnected.') {
    super(message);
  }
}

class ServiceNotAuthorizedError extends NekolyticsError {
  constructor(message = 'Nekometrics is not authorized.') {
    super(message);
  }
}

class ServiceUnavailableError extends NekolyticsError {
  constructor(message = 'Service unavailable.') {
    super(message);
  }
}

export {
  NekolyticsError,
  FriendlyError,
  ConnectivityError,
  ServiceDisconnectedError,
  ServiceUnavailableError,
  ServiceNotAuthorizedError
};