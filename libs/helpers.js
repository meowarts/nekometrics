import { useCallback, useEffect, useRef, useState } from 'react';
import { FriendlyError } from './services/errors';

const timeoutInMs = 10000;

const fetchIt = (path, fetchOpts = {}, params = null) => {
  var url = new URL(`${path}`);
  if (params != null) Object.keys(params).forEach((key) => { 
    if (typeof params[key] === 'object') {
      url.searchParams.append(key, JSON.stringify(params[key]));
    }
    else {
      url.searchParams.append(key, params[key]);
    }
  });
  const supportsAbort = typeof AbortController !== 'undefined';
  const controller = supportsAbort ? new AbortController() : null;
  // Set a maximum timeout of 10 seconds when AbortController is available
  if (controller) {
    setTimeout(() => controller.abort(), timeoutInMs);
  }
  const fetchOptsWithSignal = controller ? { ...fetchOpts, signal: controller.signal } : fetchOpts;
  return fetch(url, fetchOptsWithSignal)
    .then((res) => res.json())
    .catch(err => { 
      if (err.name === 'AbortError') {
        throw new FriendlyError(`Timeout with the service (${timeoutInMs / 1000}s max).`);
      }
      else {
        throw err;
      }
      
    });
};

const defaultOptions = { cancelOnUnmount: true, };

const useInterval = (fn, milliseconds, options = defaultOptions) => {
  const opts = { ...defaultOptions, ...(options || {}) };
  const timeout = useRef();
  const callback = useRef(fn);
  const [isCleared, setIsCleared] = useState(false);

  // the clear method
  const clear = useCallback(() => {
    if (timeout.current) {
      setIsCleared(true);
      clearInterval(timeout.current);
    }
  }, []);

  // if the provided function changes, change its reference
  useEffect(() => {
    if (typeof fn === 'function') {
      callback.current = fn;
    }
  }, [fn]);

  // when the milliseconds change, reset the timeout
  useEffect(() => {
    if (typeof milliseconds === 'number') {
      timeout.current = setInterval(() => {
        callback.current();
      }, milliseconds);
    }

    // cleanup previous interval
    return clear;
  }, [milliseconds]);

  // when component unmount clear the timeout
  useEffect(() => () => {
    if (opts.cancelOnUnmount) {
      clear();
    }
  }, []);

  return [isCleared, clear];
};

const obtainPosition = (widgets, w = 2, h = 2) => {
  let notAvailable = true;
  let matrix = [];
  for (let widget of widgets) {
    for (let cy = 0; cy < widget.h; cy++) {
      matrix[widget.y + cy] = matrix[widget.y + cy] ? matrix[widget.y + cy] : new Array(8).fill(0);
      for (let cx = 0; cx < widget.w; cx++) {
        matrix[widget.y + cy][widget.x + cx] = 1;
      }
    }
  }
  console.log({ matrix });
  let x = 0, y = 0;
  while (notAvailable) {
    notAvailable = false;
    for (let cx = 0; cx < w; cx++) {
      for (let cy = 0; cy < h; cy++) {
        if (matrix[y + cy] && matrix[y + cy][x + cx]) {
          notAvailable = true;
        }
      }
    }
    if (notAvailable && ++x > 5) {
      x = 0;
      y++;
    }
  }
  return { x, y, w, h };
}

export { fetchIt, obtainPosition, useInterval };
