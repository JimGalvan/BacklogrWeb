import { DestroyRef } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { AiResponseFormatError } from './ai-response-parser';
import { AiStreamController } from './ai-stream-controller';

describe('AiStreamController', () => {
  it('exposes malformed model output as an actionable error', () => {
    const controller = new AiStreamController(
      () => of('{bad json'),
      () => { throw new AiResponseFormatError(); },
      fakeDestroyRef(),
    );

    controller.start('workspace-1', 'issue#1');

    expect(controller.isError()).toBe(true);
    expect(controller.isStreaming()).toBe(false);
    expect(controller.errorMessage()).toContain('unreadable response');
  });

  it('preserves an error reported by the API service', () => {
    const controller = new AiStreamController(
      () => throwError(() => new Error('The provider connection was revoked.')),
      raw => raw,
      fakeDestroyRef(),
    );

    controller.start('workspace-1', 'issue#1');

    expect(controller.errorMessage()).toBe('The provider connection was revoked.');
  });

  it('unsubscribes the previous stream when a new run starts', () => {
    const teardown = vi.fn();
    const source = () => new Observable<string>(() => teardown);
    const controller = new AiStreamController(source, raw => raw, fakeDestroyRef());

    controller.start('workspace-1', 'issue#1');
    controller.start('workspace-1', 'issue#1');

    expect(teardown).toHaveBeenCalledTimes(1);
    controller.cancel();
    expect(teardown).toHaveBeenCalledTimes(2);
  });
});

function fakeDestroyRef(): DestroyRef {
  return {
    destroyed: false,
    onDestroy: () => () => {},
  } as DestroyRef;
}
