import { CalendarView } from "@/components/notes/calendar-view";

export default function CalendarPage() {
  return (
    <main className="flex-1 overflow-y-auto py-4">
      <div className="container mx-auto">
        <CalendarView />
      </div>
    </main>
  );
}
