import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SearchBar from '../../src/components/SearchBar';

describe('SearchBar', () => {
  it('expõe uma região de busca e um campo com label acessível', () => {
    render(<SearchBar onSearch={vi.fn()} />);

    expect(screen.getByRole('search', { name: 'Buscar cidade' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Cidade' })).toBe(screen.getByLabelText('Cidade'));
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeEnabled();
  });

  it('não busca ao digitar e envia o texto sem espaços externos pelo botão', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    await user.type(screen.getByRole('textbox', { name: 'Cidade' }), '  São Paulo  ');
    expect(onSearch).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(onSearch).toHaveBeenCalledExactlyOnceWith('São Paulo');
  });

  it('permite envio pelo teclado preservando acentos, apóstrofos e hífens', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    await user.tab();
    expect(screen.getByRole('textbox', { name: 'Cidade' })).toHaveFocus();
    await user.keyboard("  São João-d'Aliança  {Enter}");

    expect(onSearch).toHaveBeenCalledExactlyOnceWith("São João-d'Aliança");
  });

  it.each(['', '   '])('rejeita a consulta %j com orientação associada ao campo', async (value) => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole('textbox', { name: 'Cidade' });

    if (value) await user.type(input, value);
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Informe o nome de uma cidade.');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Informe o nome de uma cidade.');
    expect(input).toHaveFocus();

    await user.clear(input);
    await user.type(input, 'Recife{Enter}');
    expect(onSearch).toHaveBeenCalledExactlyOnceWith('Recife');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('bloqueia edição e envio enquanto disabled e permite buscar quando reabilitado', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    const { rerender } = render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole('textbox', { name: 'Cidade' });
    await user.type(input, 'Recife');

    rerender(<SearchBar onSearch={onSearch} disabled />);
    expect(input).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();
    await user.type(input, 'Natal{Enter}');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    fireEvent.submit(screen.getByRole('search'));
    expect(input).toHaveValue('Recife');
    expect(onSearch).not.toHaveBeenCalled();

    rerender(<SearchBar onSearch={onSearch} disabled={false} />);
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(onSearch).toHaveBeenCalledExactlyOnceWith('Recife');
  });

  it('associa cada label ao campo correto quando há múltiplas instâncias', () => {
    render(
      <>
        <SearchBar onSearch={vi.fn()} />
        <SearchBar onSearch={vi.fn()} />
      </>,
    );

    const inputs = screen.getAllByLabelText('Cidade');
    expect(inputs).toHaveLength(2);
    expect(inputs[0].id).not.toBe(inputs[1].id);
  });
});
