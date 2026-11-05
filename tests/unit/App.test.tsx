import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';

describe('App com mock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    render(<App />);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function search(city: string) {
    fireEvent.change(screen.getByRole('textbox', { name: 'Cidade' }), { target: { value: city } });
    fireEvent.submit(screen.getByRole('search'));
  }

  function preview(value: string) {
    fireEvent.change(screen.getByRole('combobox'), { target: { value } });
  }

  it('compõe header, busca, unidade, estado inicial e fonte sem acessar a API', () => {
    const fetch = vi.spyOn(globalThis, 'fetch');
    expect(
      within(screen.getByRole('banner')).getByRole('heading', { name: 'WeatherView' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '°C' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(screen.getByRole('main')).getByRole('status')).toHaveTextContent(
      'Consulte o clima',
    );
    expect(screen.getByRole('link', { name: 'Open-Meteo' })).toHaveAttribute(
      'href',
      'https://open-meteo.com/',
    );
    expect(screen.getByText(/Demonstração sem API/)).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('busca o mock com loading imediato e preserva Fahrenheit durante e após a busca', () => {
    const fetch = vi.spyOn(globalThis, 'fetch');
    fireEvent.click(screen.getByRole('button', { name: '°F' }));
    search('  SAO PAULO  ');
    expect(screen.getByRole('status')).toHaveTextContent('Carregando dados do clima');
    expect(screen.getByRole('textbox', { name: 'Cidade' })).toBeDisabled();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(599));
    expect(screen.getByRole('status')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Cidade' })).toBeEnabled();
    expect(screen.getByRole('region', { name: 'São Paulo' })).toHaveTextContent('79,5 °F');
    expect(screen.getAllByRole('article')).toHaveLength(5);
    expect(within(screen.getByRole('main')).getAllByText(/°F$/)).toHaveLength(11);
    expect(within(screen.getByRole('main')).queryByText(/°C$/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '°C' }));
    expect(screen.getByRole('region', { name: 'São Paulo' })).toHaveTextContent('26,4 °C');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('permite trocar unidade durante loading sem reiniciar a espera', () => {
    search('São Paulo');
    act(() => vi.advanceTimersByTime(300));
    fireEvent.click(screen.getByRole('button', { name: '°F' }));
    act(() => vi.advanceTimersByTime(300));
    expect(screen.getByRole('region', { name: 'São Paulo' })).toHaveTextContent('79,5 °F');
  });

  it('mostra vazio para outra cidade e permite corrigir a busca sem perder a unidade', () => {
    fireEvent.click(screen.getByRole('button', { name: '°F' }));
    search('Recife');
    act(() => vi.advanceTimersByTime(600));
    expect(screen.getByRole('status')).toHaveTextContent('Nenhuma cidade encontrada');
    expect(screen.getByRole('textbox', { name: 'Cidade' })).toHaveValue('Recife');
    expect(screen.getByRole('textbox', { name: 'Cidade' })).toBeEnabled();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    search('São Paulo');
    act(() => vi.advanceTimersByTime(600));
    expect(screen.getByRole('region', { name: 'São Paulo' })).toHaveTextContent('79,5 °F');
  });

  it('alterna as cinco prévias com conteúdo exclusivo e cancela a busca pendente', () => {
    search('São Paulo');
    preview('error');
    act(() => vi.advanceTimersByTime(10_000));
    expect(screen.getByRole('alert')).toHaveTextContent('Erro simulado');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    preview('success');
    expect(screen.getAllByRole('article')).toHaveLength(5);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    preview('empty');
    expect(screen.getByRole('status')).toHaveTextContent('Nenhuma cidade encontrada');
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    preview('loading');
    act(() => vi.advanceTimersByTime(10_000));
    expect(screen.getByRole('status')).toHaveTextContent('Carregando');
    preview('idle');
    expect(screen.getByRole('status')).toHaveTextContent('Consulte o clima');
    expect(screen.getByRole('textbox', { name: 'Cidade' })).toBeEnabled();
  });

  it('retry repete o último termo, não o texto editado, sem tentativas automáticas', () => {
    search('Recife');
    act(() => vi.advanceTimersByTime(600));
    preview('error');
    fireEvent.change(screen.getByRole('textbox', { name: 'Cidade' }), {
      target: { value: 'São Paulo' },
    });
    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(screen.getByRole('status')).toHaveTextContent('Carregando');
    act(() => vi.advanceTimersByTime(600));
    expect(screen.getByRole('status')).toHaveTextContent('Nenhuma cidade encontrada');
  });

  it('retry sem busca anterior usa São Paulo e não muda a unidade', () => {
    fireEvent.click(screen.getByRole('button', { name: '°F' }));
    preview('error');
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    act(() => vi.advanceTimersByTime(600));
    expect(screen.getByRole('region', { name: 'São Paulo' })).toHaveTextContent('79,5 °F');
  });

  it('não inicia loading para busca vazia e cancela o timer ao desmontar', () => {
    search('   ');
    expect(screen.getByRole('alert')).toHaveTextContent('Informe o nome de uma cidade.');
    expect(screen.getByRole('status')).toHaveTextContent('Consulte o clima');
    const cancelTimer = vi.spyOn(window, 'clearTimeout');
    search('São Paulo');
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    cleanup();
    expect(cancelTimer).toHaveBeenCalledOnce();
  });
});
