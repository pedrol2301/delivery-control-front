import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { Delivery } from '../types';

interface CalendarProps {
  deliveries: Delivery[];
  onEventClick: (delivery: Delivery) => void;
  onDateClick: (date: Date) => void;
}

const statusColors: Record<string, string> = {
  pending: '#gray',
  assigned: '#3b82f6',
  in_transit: '#f59e0b',
  delivered: '#10b981',
  failed: '#ef4444',
  cancelled: '#6b7280',
};

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  assigned: 'Atribuída',
  in_transit: 'Em trânsito',
  delivered: 'Entregue',
  failed: 'Falhou',
  cancelled: 'Cancelada',
};

export default function Calendar({ deliveries, onEventClick, onDateClick }: CalendarProps) {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const calendarEvents = deliveries.map((delivery) => ({
      id: delivery.id.toString(),
      title: `${delivery.customer_name} - ${delivery.deliverer?.name || 'Sem entregador'}`,
      start: delivery.scheduled_date,
      backgroundColor: statusColors[delivery.status],
      borderColor: statusColors[delivery.status],
      extendedProps: {
        delivery,
      },
    }));
    setEvents(calendarEvents);
  }, [deliveries]);

  const handleEventClick = (info: any) => {
    onEventClick(info.event.extendedProps.delivery);
  };

  const handleDateClick = (info: any) => {
    onDateClick(new Date(info.dateStr));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4 flex flex-wrap gap-4">
        {Object.entries(statusLabels).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: statusColors[key] }}
            />
            <span className="text-sm text-gray-700">{label}</span>
          </div>
        ))}
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={events}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        editable={false}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        height="auto"
        locale="pt-br"
        buttonText={{
          today: 'Hoje',
          month: 'Mês',
          week: 'Semana',
          day: 'Dia',
        }}
      />
    </div>
  );
}
