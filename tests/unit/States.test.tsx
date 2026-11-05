import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FormEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';
import EmptyState from '../../src/components/states/EmptyState';
import ErrorState from '../../src/components/states/ErrorState';
import LoadingState from '../../src/components/states/LoadingState';

describe('LoadingState', () => {
  it('anuncia o carregamento uma única vez, sem alerta duplicado', () => {
    render(<LoadingState />);

    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent('Carregando dados do clima…');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('permite identificar a operação em andamento', () => {
    render(<LoadingState message="Buscando cidades…" />);
    expect(screen.getByRole('status')).toHaveTextContent('Buscando cidades…');
  });
});

describe('EmptyState', () => {
  it('anuncia título e dica no mesmo status', () => {
    render(<EmptyState />);
    const status = screen.getByRole('status');

    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(
      within(status).getByRole('heading', { name: 'Nenhuma cidade encontrada' }),
    ).toBeInTheDocument();
    expect(status).toHaveTextContent('Tente buscar outra cidade ou verifique o nome informado.');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('permite personalizar título e dica para o estado inicial', () => {
    render(<EmptyState title="Consulte o clima" hint="Busque uma cidade para começar." />);

    expect(screen.getByRole('heading', { name: 'Consulte o clima' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Busque uma cidade para começar.');
  });
});

describe('ErrorState', () => {
  it.each([
    'Não foi possível conectar à fonte de dados. Tente novamente.',
    'O serviço de clima está indisponível. Tente novamente.',
    'O tempo de espera foi esgotado. Tente novamente.',
    'A resposta da fonte não pôde ser utilizada.',
    'Muitas solicitações. Aguarde antes de tentar novamente.',
  ])('anuncia a mensagem fornecida sem duplicação: %s', (message) => {
    render(<ErrorState message={message} onRetry={vi.fn()} />);

    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(screen.getByRole('alert')).toHaveTextContent(message);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeEnabled();
  });

  it('invoca somente o callback fornecido, uma vez por clique', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorState message="Não foi possível obter o clima." onRetry={onRetry} />);
    expect(onRetry).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(onRetry).toHaveBeenCalledExactlyOnceWith();
  });

  it.each(['{Enter}', ' '])('permite retry pelo teclado usando %j', async (key) => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorState message="Não foi possível obter o clima." onRetry={onRetry} />);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toHaveFocus();
    await user.keyboard(key);
    expect(onRetry).toHaveBeenCalledExactlyOnceWith();
  });

  it('não agenda tentativas automáticas', () => {
    vi.useFakeTimers();
    try {
      const onRetry = vi.fn();
      render(<ErrorState message="Aguarde antes de tentar novamente." onRetry={onRetry} />);
      vi.advanceTimersByTime(60_000);
      expect(onRetry).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('não submete um formulário ao acionar retry', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const onSubmit = vi.fn((event: FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <ErrorState message="Falha ao buscar cidades." onRetry={onRetry} />
      </form>,
    );

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(onRetry).toHaveBeenCalledExactlyOnceWith();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('exibe mensagens externas como texto literal', () => {
    const message = '<img src=x onerror=alert(1)>';
    render(<ErrorState message={message} onRetry={vi.fn()} />);
    expect(screen.getByRole('alert')).toHaveTextContent(message);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
