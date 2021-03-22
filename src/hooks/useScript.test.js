import { renderHook } from '@testing-library/react-hooks';

import useScript from './useScript';

describe('useScript', () => {
  beforeEach(() => {
    const html = document.querySelector('html');
    if (html) {
      html.innerHTML = '';
    }
  });

  it('should handle null src and not append a script tag', () => {
    expect(document.querySelectorAll('script').length).toBe(0);

    renderHook(() => useScript(null));

    expect(document.querySelectorAll('script').length).toBe(0);
  });

  it('should append the script when available', () => {
    expect(document.querySelectorAll('script').length).toBe(0);

    renderHook(() => useScript('https://script.com'));

    expect(document.querySelectorAll('script').length).toBe(1);
  });

  it('should append the script when available', () => {
    expect(document.querySelectorAll('script').length).toBe(0);

    renderHook(() => useScript('https://script.com'));

    expect(document.querySelectorAll('script').length).toBe(1);
  });

  it('should render a script only once', () => {
    expect(document.querySelectorAll('script').length).toBe(0);

    const previousScript = document.createElement('script');
    previousScript.src = 'http://script.com';
    document.body.appendChild(previousScript);

    expect(document.querySelectorAll('script').length).toBe(1);

    const handle = renderHook((p) => useScript(p), {
      initialProps: 'http://script.com',
    });
    expect(document.querySelectorAll('script').length).toBe(1);

    handle.rerender();

    expect(document.querySelectorAll('script').length).toBe(1);
  });
});
