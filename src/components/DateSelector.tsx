import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from 'lucide-react';

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value + 'T00:00:00');
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Calendar className="h-5 w-5 text-gray-600" />
          <label htmlFor="delivery-date" className="text-sm font-medium text-gray-700">
            Selecione a data:
          </label>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            id="delivery-date"
            type="date"
            value={formatDateForInput(selectedDate)}
            onChange={handleDateChange}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full sm:w-auto"
          />

          <button
            onClick={handleToday}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors whitespace-nowrap"
          >
            Hoje
          </button>
        </div>

        <div className="text-sm text-gray-600">
          {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </div>
      </div>
    </div>
  );
}
