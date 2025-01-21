"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNotes } from "@/hooks/use-notes";
import type { NoteType } from "@/types";

export function CalendarView() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const { data: notes } = useNotes();

  const getNotesForDay = (date: Date) => {
    return (
      notes?.data?.filter((note: NoteType) =>
        isSameDay(new Date(note.createdAt), date)
      ) || []
    );
  };

  const selectedNotes = selectedDay ? getNotesForDay(selectedDay) : [];

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.setMonth(currentDate.getMonth() - 1))
              )
            }
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.setMonth(currentDate.getMonth() + 1))
              )
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center font-medium p-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {eachDayOfInterval({
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate),
        }).map((day) => {
          const dayNotes = getNotesForDay(day);
          return (
            <Card
              key={day.toString()}
              className={`min-h-[100px] p-2 cursor-pointer transition-colors ${
                dayNotes.length ? "bg-secondary/50 hover:bg-secondary/70" : ""
              }`}
              onClick={() => dayNotes.length && setSelectedDay(day)}
            >
              <div className="text-sm mb-1">{format(day, "d")}</div>
              {dayNotes.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {dayNotes.length} note{dayNotes.length > 1 ? "s" : ""}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Notes for {selectedDay && format(selectedDay, "MMMM d, yyyy")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedNotes.map((note) => (
              <Card key={note._id} className="p-4">
                <p>{note.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {note.content}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {format(new Date(note.createdAt), "h:mm a")}
                </p>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
