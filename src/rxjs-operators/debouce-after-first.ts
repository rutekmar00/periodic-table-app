import { debounce, map, Observable, timer } from 'rxjs';

export const debounceAfterFirst =
  <T>(ms: number) =>
  (source: Observable<T>) => {
    return source.pipe(
      map(
        (val: T, index: number) => ({ val, index } as { index: number; val: T })
      ),
      debounce(({ index }) => timer(index === 0 ? 0 : ms)),
      map(({ val }) => val)
    );
  };
