import { people, planets } from './mock-data';

function randomizedDelay<T>(maxDelay: number, callback: () => T): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    setTimeout(() => {
      resolve(callback());
    }, Math.random() * maxDelay);
  });
}

function randomizedError<T>(errorRate: number, callback: () => T): Promise<T> {
  if (Math.random() < errorRate) {
    return Promise.reject(
      '500 Error!  I sense a great disturbance in the network.'
    );
  } else {
    return Promise.resolve(callback());
  }
}

const DEFAULT_MAX_DELAY = 3000;
const DEFAULT_ERROR_RATE = 0.5;

export function mockFetch<T>(
  { maxDelay, errorRate } = {
    maxDelay: DEFAULT_MAX_DELAY,
    errorRate: DEFAULT_ERROR_RATE
  },
  callback: () => T
): Promise<T> {
  console.log('Starting mockFetch of ' + callback.name);
  return randomizedDelay(maxDelay, () => callback())
    .then(result => randomizedError(errorRate, () => result))
    .then(
      result => {
        console.log('Successful fetch of ' + callback.name);
        return result;
      },
      error => {
        console.log('Error fetching ' + callback.name);
        throw error;
      }
    );
}

function getEmptyResponse() {
  return { results: [] };
}
let nextIsSuccess = true;
export function fetchPeople(
  { maxDelay, errorRate } = {
    maxDelay: DEFAULT_MAX_DELAY,
    errorRate: DEFAULT_ERROR_RATE
  }
) {
  function getPeople() {
    return people;
  }
  let callback: () => { results: any[] };
  if (nextIsSuccess) {
    callback = getPeople;
  } else {
    callback = getEmptyResponse;
  }
  nextIsSuccess = !nextIsSuccess;
  return mockFetch({ maxDelay: 500, errorRate: 0 }, callback);
}

let nextPlanetIsSuccess = true;
export function fetchPlanets(
  { maxDelay, errorRate } = {
    maxDelay: DEFAULT_MAX_DELAY,
    errorRate: DEFAULT_ERROR_RATE
  }
) {
  function getPlanets() {
    return planets;
  }
  let callback: () => { results: any[] };
  if (nextPlanetIsSuccess) {
    callback = getPlanets;
  } else {
    callback = getEmptyResponse;
  }
  nextPlanetIsSuccess = !nextPlanetIsSuccess;
  return mockFetch({ maxDelay: 500, errorRate: 0 }, callback);
}
