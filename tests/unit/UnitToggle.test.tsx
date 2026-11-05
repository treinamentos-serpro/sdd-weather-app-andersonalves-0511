import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type FormEvent, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import UnitToggle from '../../src/components/UnitToggle';
import type { Unit } from '../../src/types/weather';

describe('UnitToggle', () => {
  it.each<Unit>([
    'celsius',
    'fahrenheit',
  ])('expõe um grupo acessível com %s como única unidade ativa', (unit) => {
    render(<UnitToggle unit={unit} onChange={vi.fn()} />);
    const group = screen.getByRole('group', { name: 'Unidade de temperatura' });

    expect(within(group).getAllByRole('button')).toHaveLength(2);
    expect(within(group).getByRole('button', { name: '°C' })).toHaveAttribute(
      'aria-pressed',
      String(unit === 'celsius'),
    );
    expect(within(group).getByRole('button', { name: '°F' })).toHaveAttribute(
      'aria-pressed',
      String(unit === 'fahrenheit'),
    );
  });

  it('notifica a mudança uma vez e reflete a unidade recebida nas props', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<UnitToggle unit="celsius" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: '°F' }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith('fahrenheit');
    expect(screen.getByRole('button', { name: '°C' })).toHaveAttribute('aria-pressed', 'true');

    rerender(<UnitToggle unit="fahrenheit" onChange={onChange} />);
    expect(screen.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '°C' })).toHaveAttribute('aria-pressed', 'false');

    await user.click(screen.getByRole('button', { name: '°C' }));
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith('celsius');
  });

  it('não emite mudança ao clicar na unidade já ativa', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<UnitToggle unit="celsius" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: '°C' }));
    rerender(<UnitToggle unit="fahrenheit" onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: '°F' }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('permite navegar com Tab e Shift+Tab e alternar com Enter e Espaço', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    function ControlledToggle() {
      const [unit, setUnit] = useState<Unit>('celsius');
      return (
        <UnitToggle
          unit={unit}
          onChange={(nextUnit) => {
            onChange(nextUnit);
            setUnit(nextUnit);
          }}
        />
      );
    }

    render(<ControlledToggle />);
    const celsius = screen.getByRole('button', { name: '°C' });
    const fahrenheit = screen.getByRole('button', { name: '°F' });

    await user.tab();
    expect(celsius).toHaveFocus();
    await user.tab();
    expect(fahrenheit).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledExactlyOnceWith('fahrenheit');
    expect(fahrenheit).toHaveAttribute('aria-pressed', 'true');
    expect(celsius).toHaveAttribute('aria-pressed', 'false');

    await user.tab({ shift: true });
    expect(celsius).toHaveFocus();
    await user.keyboard(' ');
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith('celsius');
    expect(celsius).toHaveAttribute('aria-pressed', 'true');
    expect(fahrenheit).toHaveAttribute('aria-pressed', 'false');
  });

  it('não submete um formulário ao selecionar a unidade', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: FormEvent) => event.preventDefault());
    const onChange = vi.fn();
    render(
      <form onSubmit={onSubmit}>
        <UnitToggle unit="celsius" onChange={onChange} />
      </form>,
    );

    await user.click(screen.getByRole('button', { name: '°F' }));

    expect(onChange).toHaveBeenCalledExactlyOnceWith('fahrenheit');
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
